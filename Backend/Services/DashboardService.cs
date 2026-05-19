using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }

        // ── Tenant Dashboard ──────────────────────────────────
        // Scoped to logged-in tenant only via tenantId from JWT
        public async Task<TenantDashboardDto> GetTenantDashboardAsync(int tenantId)
        {
            var tenant = await _context.Tenants.FindAsync(tenantId);
            if (tenant == null) throw new InvalidOperationException("Tenant not found");

            var today = DateTime.UtcNow.Date;
            var currentMonth = new DateTime(today.Year, today.Month, 1);

            // ── Outstanding Summary ───────────────────────────
            // Direct from tenant record — always in sync
            var outstandingSummary = new OutstandingSummaryDto
            {
                Electricity = tenant.ElectricityOutstanding,
                Water = tenant.WaterOutstanding,
                Rent = tenant.RentOutstanding
            };

            // ── Active Bills ──────────────────────────────────
            // Get current non-obsolete bill for each type
            var activeElectricity = await _context.ElectricityUtilities
                .Where(e => e.TenantId == tenantId && !e.IsObsolete)
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new ActiveBillDto
                {
                    BillingMonth = e.BillingMonth,
                    TotalAmount = e.TotalAmount,
                    RemainingAmount = e.RemainingAmount,
                    DueDate = e.DueDate
                })
                .FirstOrDefaultAsync();

            var activeWater = await _context.WaterUtilities
                .Where(w => w.TenantId == tenantId && !w.IsObsolete)
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => new ActiveBillDto
                {
                    BillingMonth = w.BillingMonth,
                    TotalAmount = w.TotalAmount,
                    RemainingAmount = w.RemainingAmount,
                    DueDate = w.DueDate
                })
                .FirstOrDefaultAsync();

            var activeRent = await _context.RentUtilities
                .Where(r => r.TenantId == tenantId && !r.IsObsolete)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ActiveBillDto
                {
                    BillingMonth = r.BillingMonth,
                    TotalAmount = r.TotalAmount,
                    RemainingAmount = r.RemainingAmount,
                    DueDate = r.DueDate
                })
                .FirstOrDefaultAsync();

            // ── Agreement Details ─────────────────────────────
            var agreementDetails = new AgreementDetailsDto
            {
                MonthlyRent = tenant.MonthlyRent,
                AgreementDate = tenant.AgreementDate,
                EndDate = tenant.EndDate
            };

            // ── Recent Payments ───────────────────────────────
            // Last 5 payments across all bill types
            var recentElectricity = await _context.ElectricityBills
                .Where(e => e.TenantId == tenantId)
                .OrderByDescending(e => e.CreatedAt)
                .Take(5)
                .Select(e => new RecentPaymentDto
                {
                    Type = "Electricity",
                    Amount = e.Amount,
                    ModeOfPayment = e.ModeOfPayment,
                    PaymentDate = e.PaymentDate,
                    CreatedAt = e.CreatedAt
                }).ToListAsync();

            var recentWater = await _context.WaterBills
                .Where(w => w.TenantId == tenantId)
                .OrderByDescending(w => w.CreatedAt)
                .Take(5)
                .Select(w => new RecentPaymentDto
                {
                    Type = "Water",
                    Amount = w.Amount,
                    ModeOfPayment = w.ModeOfPayment,
                    PaymentDate = w.PaymentDate,
                    CreatedAt = w.CreatedAt
                }).ToListAsync();

            var recentRent = await _context.RentBills
                .Where(r => r.TenantId == tenantId)
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .Select(r => new RecentPaymentDto
                {
                    Type = "Rent",
                    Amount = r.Amount,
                    ModeOfPayment = r.ModeOfPayment,
                    PaymentDate = r.PaymentDate,
                    CreatedAt = r.CreatedAt
                }).ToListAsync();

            // Merge and take last 5 across all types
            var recentPayments = recentElectricity
                .Concat(recentWater)
                .Concat(recentRent)
                .OrderByDescending(p => p.CreatedAt)
                .Take(5)
                .ToList();

            // ── Monthly Bill Chart (last 6 months) ────────────
            // Shows billed amount per type per month for chart
            var last6Months = Enumerable.Range(0, 6)
                .Select(i => currentMonth.AddMonths(-i))
                .ToList();

            var monthlyBillChart = new List<MonthlyBillChartDto>();
            foreach (var month in last6Months)
            {
                var monthStr = month.ToString("MMM-yyyy");

                var elec = await _context.ElectricityUtilities
                    .Where(e => e.TenantId == tenantId && e.BillingMonth == monthStr)
                    .SumAsync(e => (decimal?)e.TotalAmount) ?? 0;

                var water = await _context.WaterUtilities
                    .Where(w => w.TenantId == tenantId && w.BillingMonth == monthStr)
                    .SumAsync(w => (decimal?)w.TotalAmount) ?? 0;

                var rent = await _context.RentUtilities
                    .Where(r => r.TenantId == tenantId && r.BillingMonth == monthStr)
                    .SumAsync(r => (decimal?)r.TotalAmount) ?? 0;

                monthlyBillChart.Add(new MonthlyBillChartDto
                {
                    Month = monthStr,
                    Electricity = elec,
                    Water = water,
                    Rent = rent
                });
            }

            // ── Current Month Paid vs Outstanding ─────────────
            var currentMonthStr = today.ToString("MMM-yyyy");

            var paidThisMonth =
                (await _context.ElectricityBills
                    .Where(e => e.TenantId == tenantId && e.CreatedAt >= currentMonth)
                    .SumAsync(e => (decimal?)e.Amount) ?? 0) +
                (await _context.WaterBills
                    .Where(w => w.TenantId == tenantId && w.CreatedAt >= currentMonth)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0) +
                (await _context.RentBills
                    .Where(r => r.TenantId == tenantId && r.CreatedAt >= currentMonth)
                    .SumAsync(r => (decimal?)r.Amount) ?? 0);

            var totalOutstanding = tenant.ElectricityOutstanding
                                 + tenant.WaterOutstanding
                                 + tenant.RentOutstanding;

            return new TenantDashboardDto
            {
                OutstandingSummary = outstandingSummary,
                ActiveBills = new ActiveBillsDto
                {
                    Electricity = activeElectricity,
                    Water = activeWater,
                    Rent = activeRent
                },
                AgreementDetails = agreementDetails,
                RecentPayments = recentPayments,
                MonthlyBillChart = monthlyBillChart,
                CurrentMonthPaidVsOutstanding = new PaidVsOutstandingDto
                {
                    Paid = paidThisMonth,
                    Outstanding = totalOutstanding
                }
            };
        }

        // ── Manager Dashboard ─────────────────────────────────
        // Shows collection stats, overdue bills, recent payments by this manager
        public async Task<ManagerDashboardDto> GetManagerDashboardAsync(int userId)
        {
            var today = DateTime.UtcNow.Date;
            var currentMonth = new DateTime(today.Year, today.Month, 1);


            // ── Collection Today ──────────────────────────────
            // Sum of all payments recorded today across all types
            var collectionToday =
                (await _context.ElectricityBills
                    .Where(e => e.CreatedAt.Date == today)
                    .SumAsync(e => (decimal?)e.Amount) ?? 0) +
                (await _context.WaterBills
                    .Where(w => w.CreatedAt.Date == today)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0) +
                (await _context.RentBills
                    .Where(r => r.CreatedAt.Date == today)
                    .SumAsync(r => (decimal?)r.Amount) ?? 0);

            // ── Collection This Month ─────────────────────────
            var collectionThisMonth =
                (await _context.ElectricityBills
                    .Where(e => e.CreatedAt >= currentMonth)
                    .SumAsync(e => (decimal?)e.Amount) ?? 0) +
                (await _context.WaterBills
                    .Where(w => w.CreatedAt >= currentMonth)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0) +
                (await _context.RentBills
                    .Where(r => r.CreatedAt >= currentMonth)
                    .SumAsync(r => (decimal?)r.Amount) ?? 0);

            // ── Overdue Bills Count ───────────────────────────
            // Non-obsolete bills where DueDate has passed and still has remaining amount
            var overdueElectricityCount = await _context.ElectricityUtilities
                .CountAsync(e => !e.IsObsolete && e.RemainingAmount > 0 && e.DueDate.Date < today);
            var overdueWaterCount = await _context.WaterUtilities
                .CountAsync(w => !w.IsObsolete && w.RemainingAmount > 0 && w.DueDate.Date < today);
            var overdueRentCount = await _context.RentUtilities
                .CountAsync(r => !r.IsObsolete && r.RemainingAmount > 0 && r.DueDate.Date < today);

            var overdueCount = overdueElectricityCount + overdueWaterCount + overdueRentCount;

            // ── Active Tenant Count ───────────────────────────
            var activeTenantCount = await _context.Tenants
                .CountAsync(t => t.Status == "Active");

            // ── Overdue Bills List ────────────────────────────
            var overdueElectricity = await _context.ElectricityUtilities
                .Include(e => e.Tenant)
                .Where(e => !e.IsObsolete && e.RemainingAmount > 0 && e.DueDate.Date < today)
                .Select(e => new OverdueBillDto
                {
                    TenantName = e.Tenant.Company,
                    Type = "Electricity",
                    OverdueSince = e.DueDate,
                    Amount = e.RemainingAmount
                }).ToListAsync();

            var overdueWater = await _context.WaterUtilities
                .Include(w => w.Tenant)
                .Where(w => !w.IsObsolete && w.RemainingAmount > 0 && w.DueDate.Date < today)
                .Select(w => new OverdueBillDto
                {
                    TenantName = w.Tenant.Company,
                    Type = "Water",
                    OverdueSince = w.DueDate,
                    Amount = w.RemainingAmount
                }).ToListAsync();

            var overdueRent = await _context.RentUtilities
                .Include(r => r.Tenant)
                .Where(r => !r.IsObsolete && r.RemainingAmount > 0 && r.DueDate.Date < today)
                .Select(r => new OverdueBillDto
                {
                    TenantName = r.Tenant.Company,
                    Type = "Rent",
                    OverdueSince = r.DueDate,
                    Amount = r.RemainingAmount
                }).ToListAsync();

            var overdueBills = overdueElectricity
                .Concat(overdueWater)
                .Concat(overdueRent)
                .OrderBy(o => o.OverdueSince)
                .ToList();

            // ── Recent Payments by this Manager ───────────────
            var recentPayments = await _context.ElectricityBills
                .Where(e => e.CreatedBy.EndsWith($"- {userId}"))
                .OrderByDescending(e => e.CreatedAt)
                .Take(10)
                .Select(e => new RecentPaymentDto
                {
                    Type = "Electricity",
                    Amount = e.Amount,
                    ModeOfPayment = e.ModeOfPayment,
                    PaymentDate = e.PaymentDate,
                    CreatedAt = e.CreatedAt
                }).ToListAsync();

            // ── Top Outstanding Tenants ───────────────────────
            var topOutstanding = await _context.Tenants
                .Where(t => t.Status == "Active")
                .OrderByDescending(t => t.ElectricityOutstanding
                                      + t.WaterOutstanding
                                      + t.RentOutstanding)
                .Take(5)
                .Select(t => new TopOutstandingDto
                {
                    TenantName = t.Company,
                    TotalOutstanding = t.ElectricityOutstanding
                                     + t.WaterOutstanding
                                     + t.RentOutstanding
                })
                .ToListAsync();

            // ── Monthly Collection Chart (last 6 months) ──────
            var last6Months = Enumerable.Range(0, 6)
                .Select(i => currentMonth.AddMonths(-i))
                .ToList();

            var monthlyCollectionChart = new List<MonthlyCollectionChartDto>();
            foreach (var month in last6Months)
            {
                var monthStart = month;
                var monthEnd = month.AddMonths(1);
                var monthStr = month.ToString("MMM-yyyy");

                var elec = await _context.ElectricityBills
                    .Where(e => e.CreatedAt >= monthStart && e.CreatedAt < monthEnd)
                    .SumAsync(e => (decimal?)e.Amount) ?? 0;

                var water = await _context.WaterBills
                    .Where(w => w.CreatedAt >= monthStart && w.CreatedAt < monthEnd)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0;

                var rent = await _context.RentBills
                    .Where(r => r.CreatedAt >= monthStart && r.CreatedAt < monthEnd)
                    .SumAsync(r => (decimal?)r.Amount) ?? 0;

                monthlyCollectionChart.Add(new MonthlyCollectionChartDto
                {
                    Month = monthStr,
                    Electricity = elec,
                    Water = water,
                    Rent = rent
                });
            }

            return new ManagerDashboardDto
            {
                CollectionToday = collectionToday,
                CollectionThisMonth = collectionThisMonth,
                OverdueBillsCount = overdueCount,
                ActiveTenantCount = activeTenantCount,
                OverdueBills = overdueBills,
                RecentPayments = recentPayments,
                TopOutstandingTenants = topOutstanding,
                MonthlyCollectionChart = monthlyCollectionChart,
                OverdueBillsByTypeChart = new OverdueBillsByTypeDto
                {
                    Electricity = overdueElectricityCount,
                    Water = overdueWaterCount,
                    Rent = overdueRentCount
                },
                TopOutstandingChart = topOutstanding
                    .Select(t => new TopOutstandingChartDto
                    {
                        Name = t.TenantName,
                        Amount = t.TotalOutstanding
                    }).ToList()
            };
        }

        // ── Admin Dashboard ───────────────────────────────────
        // Full financial overview — banks, users, revenue, efficiency
        public async Task<AdminDashboardDto> GetAdminDashboardAsync()
        {
            var today = DateTime.UtcNow.Date;
            var currentMonth = new DateTime(today.Year, today.Month, 1);

            Console.WriteLine("Current Month: " + currentMonth);


            // ── Total Revenue This Month ──────────────────────
            var totalRevenueThisMonth =
                (await _context.ElectricityBills
                    .Where(e => e.CreatedAt >= currentMonth)
                    .SumAsync(e => (decimal?)e.Amount) ?? 0) +
                (await _context.WaterBills
                    .Where(w => w.CreatedAt >= currentMonth)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0) +
                (await _context.RentBills
                    .Where(r => r.CreatedAt >= currentMonth)
                    .SumAsync(r => (decimal?)r.Amount) ?? 0);

            // ── Total Outstanding All Tenants ─────────────────
            var totalOutstanding = await _context.Tenants
                .Where(t => t.Status == "Active")
                .SumAsync(t => t.ElectricityOutstanding
                              + t.WaterOutstanding
                              + t.RentOutstanding);

            // ── Total Bank Balance ────────────────────────────
            var totalBankBalance = await _context.Banks
                .Where(b => !b.IsDeleted)
                .SumAsync(b => b.CurrentBalance);

            // ── Active Tenant Count ───────────────────────────
            var activeTenantCount = await _context.Tenants
                .CountAsync(t => t.Status == "Active");

            // ── System Overdue Count ──────────────────────────
            var systemOverdueCount =
                await _context.ElectricityUtilities
                    .CountAsync(e => !e.IsObsolete && e.RemainingAmount > 0 && e.DueDate.Date < today) +
                await _context.WaterUtilities
                    .CountAsync(w => !w.IsObsolete && w.RemainingAmount > 0 && w.DueDate.Date < today) +
                await _context.RentUtilities
                    .CountAsync(r => !r.IsObsolete && r.RemainingAmount > 0 && r.DueDate.Date < today);

            // ── Bank Summary ──────────────────────────────────
            var bankSummary = await _context.Banks
                .Where(b => !b.IsDeleted)
                .Select(b => new BankSummaryDto
                {
                    BankName = b.BankName,
                    AccountNumber = b.AccountNumber,
                    CurrentBalance = b.CurrentBalance
                }).ToListAsync();

            // ── User Collection Summary This Month ────────────
            var userCollectionSummary = await _context.Users
                .Where(u => u.Role == "Manager" && u.IsActive)
                .Select(u => new UserCollectionDto
                {
                    UserName = u.Name,
                    TotalThisMonth =
                        (_context.ElectricityBills
                            .Where(e => e.CreatedBy == (u.Name + " - " + u.Id.ToString())
                                    && e.CreatedAt >= currentMonth)
                            .Sum(e => (decimal?)e.Amount) ?? 0) +

                        (_context.WaterBills
                            .Where(w => w.CreatedBy == (u.Name + " - " + u.Id.ToString())
                                    && w.CreatedAt >= currentMonth)
                            .Sum(w => (decimal?)w.Amount) ?? 0) +

                        (_context.RentBills
                            .Where(r => r.CreatedBy == (u.Name + " - " + u.Id.ToString())
                                    && r.CreatedAt >= currentMonth)
                            .Sum(r => (decimal?)r.Amount) ?? 0)

                }).ToListAsync();


            // ── Monthly Revenue Chart (last 6 months) ─────────
            var last6Months = Enumerable.Range(0, 6)
                .Select(i => currentMonth.AddMonths(-i))
                .ToList();

            var monthlyRevenueChart = new List<MonthlyRevenueChartDto>();
            foreach (var month in last6Months)
            {
                var monthStart = month;
                var monthEnd = month.AddMonths(1);

                var total =
                    (await _context.ElectricityBills
                        .Where(e => e.CreatedAt >= monthStart && e.CreatedAt < monthEnd)
                        .SumAsync(e => (decimal?)e.Amount) ?? 0) +
                    (await _context.WaterBills
                        .Where(w => w.CreatedAt >= monthStart && w.CreatedAt < monthEnd)
                        .SumAsync(w => (decimal?)w.Amount) ?? 0) +
                    (await _context.RentBills
                        .Where(r => r.CreatedAt >= monthStart && r.CreatedAt < monthEnd)
                        .SumAsync(r => (decimal?)r.Amount) ?? 0);

                monthlyRevenueChart.Add(new MonthlyRevenueChartDto
                {
                    Month = month.ToString("MMM-yyyy"),
                    Total = total
                });
            }

            // ── Revenue By Type Chart (this month) ────────────
            var revenueByType = new RevenueByTypeDto
            {
                Electricity = await _context.ElectricityBills
                    .Where(e => e.CreatedAt >= currentMonth)
                    .SumAsync(e => (decimal?)e.Amount) ?? 0,
                Water = await _context.WaterBills
                    .Where(w => w.CreatedAt >= currentMonth)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0,
                Rent = await _context.RentBills
                    .Where(r => r.CreatedAt >= currentMonth)
                    .SumAsync(r => (decimal?)r.Amount) ?? 0,
                Commission = await _context.ProductionVouchers
                    .Where(v => v.CreatedAt >= currentMonth)
                    .SumAsync(v => (decimal?)v.TotalAmount) ?? 0
            };

            // ── Bank Balance Chart ────────────────────────────
            var bankBalanceChart = await _context.Banks
                .Where(b => !b.IsDeleted)
                .Select(b => new BankBalanceChartDto
                {
                    BankName = b.BankName,
                    Balance = b.CurrentBalance
                }).ToListAsync();

            // ── Collection Efficiency Chart (last 6 months) ───
            // Billed = total utilities created that month
            // Collected = total payments received that month
            var collectionEfficiencyChart = new List<CollectionEfficiencyDto>();
            foreach (var month in last6Months)
            {
                var monthStart = month;
                var monthEnd = month.AddMonths(1);
                var monthStr = month.ToString("MMM-yyyy");

                var billed =
                    (await _context.ElectricityUtilities
                        .Where(e => e.CreatedAt >= monthStart && e.CreatedAt < monthEnd)
                        .SumAsync(e => (decimal?)e.TotalAmount) ?? 0) +
                    (await _context.WaterUtilities
                        .Where(w => w.CreatedAt >= monthStart && w.CreatedAt < monthEnd)
                        .SumAsync(w => (decimal?)w.TotalAmount) ?? 0) +
                    (await _context.RentUtilities
                        .Where(r => r.CreatedAt >= monthStart && r.CreatedAt < monthEnd)
                        .SumAsync(r => (decimal?)r.TotalAmount) ?? 0);

                var collected =
                    (await _context.ElectricityBills
                        .Where(e => e.CreatedAt >= monthStart && e.CreatedAt < monthEnd)
                        .SumAsync(e => (decimal?)e.Amount) ?? 0) +
                    (await _context.WaterBills
                        .Where(w => w.CreatedAt >= monthStart && w.CreatedAt < monthEnd)
                        .SumAsync(w => (decimal?)w.Amount) ?? 0) +
                    (await _context.RentBills
                        .Where(r => r.CreatedAt >= monthStart && r.CreatedAt < monthEnd)
                        .SumAsync(r => (decimal?)r.Amount) ?? 0);

                collectionEfficiencyChart.Add(new CollectionEfficiencyDto
                {
                    Month = monthStr,
                    Billed = billed,
                    Collected = collected
                });
            }

            return new AdminDashboardDto
            {
                TotalRevenueThisMonth = totalRevenueThisMonth,
                TotalOutstandingAllTenants = totalOutstanding,
                TotalBankBalance = totalBankBalance,
                ActiveTenantCount = activeTenantCount,
                SystemOverdueCount = systemOverdueCount,
                BankSummary = bankSummary,
                UserCollectionSummary = userCollectionSummary,
                MonthlyRevenueChart = monthlyRevenueChart,
                RevenueByTypeChart = revenueByType,
                BankBalanceChart = bankBalanceChart,
                CollectionEfficiencyChart = collectionEfficiencyChart
            };
        }
    }
}