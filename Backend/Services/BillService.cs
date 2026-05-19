

using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class BillService : IBillService
    {
        private readonly AppDbContext _context;
        private readonly ITenantService _tenantService;

        public BillService(AppDbContext context, ITenantService tenantService)
        {
            _context = context;
            _tenantService = tenantService;
        }

        public async Task<int> CreatePaymentAsync(CreatePaymentDto dto, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new InvalidOperationException("User not found");

            Console.WriteLine($"Creating payment: User={user.Name} (ID={userId}), BillType={dto.BillType}, UtilityId={dto.UtilityId}, Amount={dto.Amount}");



            var createdBy = $"{user.Name} - {userId}";
            Tenant? tenant = null;
            int billId = 0;

            if (dto.BillType == "Electricity")
            {
                var utility = await _context.ElectricityUtilities.FindAsync(dto.UtilityId);
                if (utility == null || utility.IsObsolete)
                    throw new InvalidOperationException("Electricity utility not found or obsolete");
                if (dto.Amount <= 0 || dto.Amount > utility.RemainingAmount)
                    throw new InvalidOperationException("Invalid payment amount");

                tenant = await _context.Tenants.FindAsync(utility.TenantId);

                var bill = new ElectricityBill
                {
                    ElectricityUtilityId = utility.Id,
                    TenantId = utility.TenantId,
                    Amount = dto.Amount,
                    ModeOfPayment = dto.ModeOfPayment,
                    ChequeNo = dto.ChequeNo,
                    PayOrderNo = dto.PayOrderNo,
                    BankId = dto.BankId,
                    PaymentDate = dto.PaymentDate,
                    CreatedBy = createdBy,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ElectricityBills.Add(bill);
                utility.RemainingAmount -= dto.Amount;
                if (utility.RemainingAmount == 0)
                    utility.Status = "Paid";
                else if (utility.RemainingAmount < utility.TotalAmount)
                    utility.Status = "Partially Paid";
                else
                    utility.Status = "Unpaid";
                tenant!.ElectricityOutstanding -= dto.Amount;
                await _context.SaveChangesAsync();
                billId = bill.Id;
            }
            else if (dto.BillType == "Water")
            {
                var utility = await _context.WaterUtilities.FindAsync(dto.UtilityId);
                if (utility == null || utility.IsObsolete)
                    throw new InvalidOperationException("Water utility not found or obsolete");
                if (dto.Amount <= 0 || dto.Amount > utility.RemainingAmount)
                    throw new InvalidOperationException("Invalid payment amount");

                tenant = await _context.Tenants.FindAsync(utility.TenantId);

                var bill = new WaterBill
                {
                    WaterUtilityId = utility.Id,
                    TenantId = utility.TenantId,
                    Amount = dto.Amount,
                    ModeOfPayment = dto.ModeOfPayment,
                    ChequeNo = dto.ChequeNo,
                    PayOrderNo = dto.PayOrderNo,
                    BankId = dto.BankId,
                    PaymentDate = dto.PaymentDate,
                    CreatedBy = createdBy,
                    CreatedAt = DateTime.UtcNow
                };

                _context.WaterBills.Add(bill);
                utility.RemainingAmount -= dto.Amount;
                if (utility.RemainingAmount == 0)
                    utility.Status = "Paid";
                else if (utility.RemainingAmount < utility.TotalAmount)
                    utility.Status = "Partially Paid";
                else
                    utility.Status = "Unpaid";
                tenant!.WaterOutstanding -= dto.Amount;
                await _context.SaveChangesAsync();
                billId = bill.Id;
            }
            else if (dto.BillType == "Rent")
            {
                var utility = await _context.RentUtilities.FindAsync(dto.UtilityId);
                if (utility == null || utility.IsObsolete)
                    throw new InvalidOperationException("Rent utility not found or obsolete");
                if (dto.Amount <= 0 || dto.Amount > utility.RemainingAmount)
                    throw new InvalidOperationException("Invalid payment amount");

                tenant = await _context.Tenants.FindAsync(utility.TenantId);

                var bill = new RentBill
                {
                    RentUtilityId = utility.Id,
                    TenantId = utility.TenantId,
                    Amount = dto.Amount,
                    ModeOfPayment = dto.ModeOfPayment,
                    ChequeNo = dto.ChequeNo,
                    PayOrderNo = dto.PayOrderNo,
                    BankId = dto.BankId,
                    PaymentDate = dto.PaymentDate,
                    CreatedBy = createdBy,
                    CreatedAt = DateTime.UtcNow
                };

                _context.RentBills.Add(bill);
                utility.RemainingAmount -= dto.Amount;
                if (utility.RemainingAmount == 0)
                    utility.Status = "Paid";
                else if (utility.RemainingAmount < utility.TotalAmount)
                    utility.Status = "Partially Paid";
                else
                    utility.Status = "Unpaid";
                tenant!.RentOutstanding -= dto.Amount;
                await _context.SaveChangesAsync();
                billId = bill.Id;
            }
            else
            {
                throw new InvalidOperationException("Invalid bill type");
            }

            // ── Bank Transaction ─────────────────────────────────
            if (dto.BankId.HasValue)
            {
                var bank = await _context.Banks.FindAsync(dto.BankId.Value);
                if (bank == null || bank.IsDeleted)
                    throw new InvalidOperationException("Bank not found");

                var bankTransaction = new BankTransaction
                {
                    BankId = dto.BankId.Value,
                    Type = "Credit",
                    Amount = dto.Amount,
                    Description = $"{dto.BillType} payment - {dto.ModeOfPayment} - Tenant {tenant!.Id}",
                    CreatedBy = createdBy,
                    CreatedAt = DateTime.UtcNow
                };

                _context.BankTransactions.Add(bankTransaction);
                bank.CurrentBalance += dto.Amount;
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();
            return billId;
        }

        public async Task<PagedResultDto<PaymentResponseDto>> GetPaymentsByTenantAsync(
            int tenantId, string billType, int pageNumber, int pageSize,
            string? modeOfPayment, string? billingMonth)
        {
            PagedResultDto<PaymentResponseDto> result = new();

            if (billType == "Electricity")
            {
                var query = _context.ElectricityBills
                    .Include(e => e.Tenant)
                    .Include(e => e.ElectricityUtility)
                    .Include(e => e.Bank)
                    // .Where(e => e.TenantId == tenantId)
                    .AsQueryable();

                if (tenantId > 0)
                    query = query.Where(e => e.TenantId == tenantId);

                if (!string.IsNullOrEmpty(modeOfPayment))
                    query = query.Where(e => e.ModeOfPayment == modeOfPayment);

                if (!string.IsNullOrEmpty(billingMonth))
                    query = query.Where(e => e.ElectricityUtility.BillingMonth == billingMonth);

                var totalCount = await query.CountAsync();
                var data = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(e => new PaymentResponseDto
                    {
                        Id = e.Id,
                        UtilityId = e.ElectricityUtilityId,
                        TenantId = e.TenantId,
                        CompanyName = e.Tenant.Company,
                        BillType = "Electricity",
                        Amount = e.Amount,
                        ModeOfPayment = e.ModeOfPayment,
                        ChequeNo = e.ChequeNo,
                        PayOrderNo = e.PayOrderNo,
                        BankId = e.BankId,
                        BankName = e.Bank != null ? e.Bank.BankName : null,
                        PaymentDate = e.PaymentDate,
                        CreatedBy = e.CreatedBy,
                        CreatedAt = e.CreatedAt
                    }).ToListAsync();

                result = new PagedResultDto<PaymentResponseDto>
                {
                    Data = data, TotalCount = totalCount,
                    PageNumber = pageNumber, PageSize = pageSize
                };
            }
            else if (billType == "Water")
            {
                var query = _context.WaterBills
                    .Include(w => w.Tenant)
                    .Include(w => w.WaterUtility)
                    .Include(w => w.Bank)
                    // .Where(w => w.TenantId == tenantId)
                    .AsQueryable();

                if (tenantId > 0)
                    query = query.Where(w => w.TenantId == tenantId);

                if (!string.IsNullOrEmpty(modeOfPayment))
                    query = query.Where(w => w.ModeOfPayment == modeOfPayment);

                if (!string.IsNullOrEmpty(billingMonth))
                    query = query.Where(w => w.WaterUtility.BillingMonth == billingMonth);

                var totalCount = await query.CountAsync();
                var data = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(w => new PaymentResponseDto
                    {
                        Id = w.Id,
                        UtilityId = w.WaterUtilityId,
                        TenantId = w.TenantId,
                        CompanyName = w.Tenant.Company,
                        BillType = "Water",
                        Amount = w.Amount,
                        ModeOfPayment = w.ModeOfPayment,
                        ChequeNo = w.ChequeNo,
                        PayOrderNo = w.PayOrderNo,
                        BankId = w.BankId,
                        BankName = w.Bank != null ? w.Bank.BankName : null,
                        PaymentDate = w.PaymentDate,
                        CreatedBy = w.CreatedBy,
                        CreatedAt = w.CreatedAt
                    }).ToListAsync();

                result = new PagedResultDto<PaymentResponseDto>
                {
                    Data = data, TotalCount = totalCount,
                    PageNumber = pageNumber, PageSize = pageSize
                };
            }
            else if (billType == "Rent")
            {
                var query = _context.RentBills
                    .Include(r => r.Tenant)
                    .Include(r => r.RentUtility)
                    .Include(r => r.Bank)
                    // .Where(r => r.TenantId == tenantId)
                    .AsQueryable();

                if (tenantId > 0)
                    query = query.Where(r => r.TenantId == tenantId);

                if (!string.IsNullOrEmpty(modeOfPayment))
                    query = query.Where(r => r.ModeOfPayment == modeOfPayment);

                if (!string.IsNullOrEmpty(billingMonth))
                    query = query.Where(r => r.RentUtility.BillingMonth == billingMonth);

                var totalCount = await query.CountAsync();
                var data = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new PaymentResponseDto
                    {
                        Id = r.Id,
                        UtilityId = r.RentUtilityId,
                        TenantId = r.TenantId,
                        CompanyName = r.Tenant.Company,
                        BillType = "Rent",
                        Amount = r.Amount,
                        ModeOfPayment = r.ModeOfPayment,
                        ChequeNo = r.ChequeNo,
                        PayOrderNo = r.PayOrderNo,
                        BankId = r.BankId,
                        BankName = r.Bank != null ? r.Bank.BankName : null,
                        PaymentDate = r.PaymentDate,
                        CreatedBy = r.CreatedBy,
                        CreatedAt = r.CreatedAt
                    }).ToListAsync();

                result = new PagedResultDto<PaymentResponseDto>
                {
                    Data = data, TotalCount = totalCount,
                    PageNumber = pageNumber, PageSize = pageSize
                };
            }
            else
            {
                throw new InvalidOperationException("Invalid bill type");
            }

            return result;
        }

        public async Task<bool> ChequeBounceAsync(ChequeBounceDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            if (dto.BillType == "Electricity")
            {
                var bill = await _context.ElectricityBills
                    .Include(e => e.ElectricityUtility)
                    .FirstOrDefaultAsync(e => e.Id == dto.BillId);
                if (bill == null) throw new InvalidOperationException("Bill not found");
                if (bill.ModeOfPayment != "Cheque")
                    throw new InvalidOperationException("Bill is not a cheque payment");

                var utility = bill.ElectricityUtility;
                var tenant = await _context.Tenants.FindAsync(bill.TenantId);

                utility.RemainingAmount += bill.Amount;
                if (utility.RemainingAmount == utility.TotalAmount)
                    utility.Status = "Unpaid";
                else
                    utility.Status = "Partially Paid";
                tenant!.ElectricityOutstanding += bill.Amount;

                if (bill.BankId.HasValue)
                {
                    var bank = await _context.Banks.FindAsync(bill.BankId.Value);
                    bank!.CurrentBalance -= bill.Amount;
                    _context.BankTransactions.Add(new BankTransaction
                    {
                        BankId = bill.BankId.Value,
                        Type = "Debit",
                        Amount = bill.Amount,
                        Description = $"Cheque bounce - ElectricityBill {bill.Id}",
                        CreatedBy = "system",
                        CreatedAt = DateTime.UtcNow
                    });
                }

                _context.ElectricityBills.Remove(bill);
            }
            else if (dto.BillType == "Water")
            {
                var bill = await _context.WaterBills
                    .Include(w => w.WaterUtility)
                    .FirstOrDefaultAsync(w => w.Id == dto.BillId);
                if (bill == null) throw new InvalidOperationException("Bill not found");
                if (bill.ModeOfPayment != "Cheque")
                    throw new InvalidOperationException("Bill is not a cheque payment");

                var utility = bill.WaterUtility;
                var tenant = await _context.Tenants.FindAsync(bill.TenantId);

                utility.RemainingAmount += bill.Amount;
                tenant!.WaterOutstanding += bill.Amount;

                if (bill.BankId.HasValue)
                {
                    var bank = await _context.Banks.FindAsync(bill.BankId.Value);
                    bank!.CurrentBalance -= bill.Amount;
                    _context.BankTransactions.Add(new BankTransaction
                    {
                        BankId = bill.BankId.Value,
                        Type = "Debit",
                        Amount = bill.Amount,
                        Description = $"Cheque bounce - WaterBill {bill.Id}",
                        CreatedBy = "system",
                        CreatedAt = DateTime.UtcNow
                    });
                }

                _context.WaterBills.Remove(bill);
            }
            else if (dto.BillType == "Rent")
            {
                var bill = await _context.RentBills
                    .Include(r => r.RentUtility)
                    .FirstOrDefaultAsync(r => r.Id == dto.BillId);
                if (bill == null) throw new InvalidOperationException("Bill not found");
                if (bill.ModeOfPayment != "Cheque")
                    throw new InvalidOperationException("Bill is not a cheque payment");

                var utility = bill.RentUtility;
                var tenant = await _context.Tenants.FindAsync(bill.TenantId);

                utility.RemainingAmount += bill.Amount;
                tenant!.RentOutstanding += bill.Amount;

                if (bill.BankId.HasValue)
                {
                    var bank = await _context.Banks.FindAsync(bill.BankId.Value);
                    bank!.CurrentBalance -= bill.Amount;
                    _context.BankTransactions.Add(new BankTransaction
                    {
                        BankId = bill.BankId.Value,
                        Type = "Debit",
                        Amount = bill.Amount,
                        Description = $"Cheque bounce - RentBill {bill.Id}",
                        CreatedBy = "system",
                        CreatedAt = DateTime.UtcNow
                    });
                }

                _context.RentBills.Remove(bill);
            }
            else
            {
                throw new InvalidOperationException("Invalid bill type");
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }   


        public async Task<PagedResultDto<PaymentResponseDto>> GetMyTenantPaymentsAsync(
            int userId, string billType, int pageNumber, int pageSize,
            string? modeOfPayment, string? billingMonth)
        {
            PagedResultDto<PaymentResponseDto> result = new();

            var tenantId = _context.Users.FirstOrDefault(u => u.Id == userId)?.TenantId;

            if (tenantId == null)
                throw new InvalidOperationException("Tenant not found for the user");

            if (billType == "Electricity")
            {
                var query = _context.ElectricityBills
                    .Include(e => e.Tenant)
                    .Include(e => e.ElectricityUtility)
                    .Include(e => e.Bank)
                    .Where(e => e.TenantId == tenantId)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(modeOfPayment))
                    query = query.Where(e => e.ModeOfPayment == modeOfPayment);

                if (!string.IsNullOrEmpty(billingMonth))
                    query = query.Where(e => e.ElectricityUtility.BillingMonth == billingMonth);

                var totalCount = await query.CountAsync();
                var data = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(e => new PaymentResponseDto
                    {
                        Id = e.Id,
                        UtilityId = e.ElectricityUtilityId,
                        TenantId = e.TenantId,
                        CompanyName = e.Tenant.Company,
                        BillType = "Electricity",
                        Amount = e.Amount,
                        ModeOfPayment = e.ModeOfPayment,
                        ChequeNo = e.ChequeNo,
                        PayOrderNo = e.PayOrderNo,
                        BankId = e.BankId,
                        BankName = e.Bank != null ? e.Bank.BankName : null,
                        PaymentDate = e.PaymentDate,
                        CreatedBy = e.CreatedBy,
                        CreatedAt = e.CreatedAt
                    }).ToListAsync();

                result = new PagedResultDto<PaymentResponseDto>
                {
                    Data = data, TotalCount = totalCount,
                    PageNumber = pageNumber, PageSize = pageSize
                };
            }
            else if (billType == "Water")
            {
                var query = _context.WaterBills
                    .Include(w => w.Tenant)
                    .Include(w => w.WaterUtility)
                    .Include(w => w.Bank)
                    .Where(w => w.TenantId == tenantId)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(modeOfPayment))
                    query = query.Where(w => w.ModeOfPayment == modeOfPayment);

                if (!string.IsNullOrEmpty(billingMonth))
                    query = query.Where(w => w.WaterUtility.BillingMonth == billingMonth);

                var totalCount = await query.CountAsync();
                var data = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(w => new PaymentResponseDto
                    {
                        Id = w.Id,
                        UtilityId = w.WaterUtilityId,
                        TenantId = w.TenantId,
                        CompanyName = w.Tenant.Company,
                        BillType = "Water",
                        Amount = w.Amount,
                        ModeOfPayment = w.ModeOfPayment,
                        ChequeNo = w.ChequeNo,
                        PayOrderNo = w.PayOrderNo,
                        BankId = w.BankId,
                        BankName = w.Bank != null ? w.Bank.BankName : null,
                        PaymentDate = w.PaymentDate,
                        CreatedBy = w.CreatedBy,
                        CreatedAt = w.CreatedAt
                    }).ToListAsync();

                result = new PagedResultDto<PaymentResponseDto>
                {
                    Data = data, TotalCount = totalCount,
                    PageNumber = pageNumber, PageSize = pageSize
                };
            }
            else if (billType == "Rent")
            {
                var query = _context.RentBills
                    .Include(r => r.Tenant)
                    .Include(r => r.RentUtility)
                    .Include(r => r.Bank)
                    .Where(r => r.TenantId == tenantId)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(modeOfPayment))
                    query = query.Where(r => r.ModeOfPayment == modeOfPayment);

                if (!string.IsNullOrEmpty(billingMonth))
                    query = query.Where(r => r.RentUtility.BillingMonth == billingMonth);

                var totalCount = await query.CountAsync();
                var data = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new PaymentResponseDto
                    {
                        Id = r.Id,
                        UtilityId = r.RentUtilityId,
                        TenantId = r.TenantId,
                        CompanyName = r.Tenant.Company,
                        BillType = "Rent",
                        Amount = r.Amount,
                        ModeOfPayment = r.ModeOfPayment,
                        ChequeNo = r.ChequeNo,
                        PayOrderNo = r.PayOrderNo,
                        BankId = r.BankId,
                        BankName = r.Bank != null ? r.Bank.BankName : null,
                        PaymentDate = r.PaymentDate,
                        CreatedBy = r.CreatedBy,
                        CreatedAt = r.CreatedAt
                    }).ToListAsync();

                result = new PagedResultDto<PaymentResponseDto>
                {
                    Data = data, TotalCount = totalCount,
                    PageNumber = pageNumber, PageSize = pageSize
                };
            }
            else
            {
                throw new InvalidOperationException("Invalid bill type");
            }

            return result;
        }

        


    }

}