using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;


namespace Backend.Services
{
    public class ReportService : IReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<byte[]> GetBankTransactionsReportAsync(int bankId, DateTime? fromDate, DateTime? toDate)
        {
            var query = _context.BankTransactions
                .Include(bt => bt.Bank)
                .Where(bt => bt.BankId == bankId);

            if (fromDate.HasValue)
                query = query.Where(bt => bt.CreatedAt >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(bt => bt.CreatedAt <= toDate.Value);

            var transactions = await query
                .OrderBy(bt => bt.CreatedAt)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Bank Transactions");

            // Header row
            var headers = new[] { "Date", "VoucherNo", "Description", "Type", "Amount", "CreatedBy" };
            for (int i = 0; i < headers.Length; i++)
            {
                var cell = worksheet.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#002365");
            }

            // Data rows
            for (int i = 0; i < transactions.Count; i++)
            {
                var row = i + 2;
                var t = transactions[i];

                worksheet.Cell(row, 1).Value = t.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
                worksheet.Cell(row, 2).Value = t.Id;
                worksheet.Cell(row, 3).Value = t.Description;
                worksheet.Cell(row, 4).Value = t.Type;
                worksheet.Cell(row, 5).Value = t.Amount;
                worksheet.Cell(row, 6).Value = t.CreatedBy;
            }

            worksheet.Columns().AdjustToContents();

            using var memoryStream = new MemoryStream();
            workbook.SaveAs(memoryStream);
            return memoryStream.ToArray();
        }

        public async Task<byte[]> GetTenantReportAsync()
        {
            var tenants = await _context.Tenants
                .Where(t => t.Status == "Active")
                .OrderBy(t => t.Company)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Tenants");

            // Header row
            var headers = new[]
            {
                "ID", "Company", "Category", "Address", "Contact Person",
                "Contact Number", "Monthly Rent", "Agreement Date", "End Date",
                "Electricity Outstanding", "Water Outstanding", "Rent Outstanding"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                var cell = worksheet.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#002365");
            }

            // Data rows
            for (int i = 0; i < tenants.Count; i++)
            {
                var row = i + 2;
                var t = tenants[i];

                worksheet.Cell(row, 1).Value  = t.Id;
                worksheet.Cell(row, 2).Value  = t.Company;
                worksheet.Cell(row, 3).Value  = t.Category;
                worksheet.Cell(row, 4).Value  = t.Address;
                worksheet.Cell(row, 5).Value  = t.ContactPerson;
                worksheet.Cell(row, 6).Value  = t.ContactNumber;
                worksheet.Cell(row, 7).Value  = t.MonthlyRent;
                worksheet.Cell(row, 8).Value  = t.AgreementDate.ToString("yyyy-MM-dd");
                worksheet.Cell(row, 9).Value  = t.EndDate.ToString("yyyy-MM-dd");
                worksheet.Cell(row, 10).Value = t.ElectricityOutstanding;
                worksheet.Cell(row, 11).Value = t.WaterOutstanding;
                worksheet.Cell(row, 12).Value = t.RentOutstanding;
            }

            worksheet.Columns().AdjustToContents();

            using var memoryStream = new MemoryStream();
            workbook.SaveAs(memoryStream);
            return memoryStream.ToArray();
        }

        public async Task<byte[]> GetTenantBillsReportAsync(int tenantId)
        {
            var electricityBills = await _context.ElectricityUtilities
                .Where(e => e.TenantId == tenantId)
                .OrderBy(e => e.BillingMonth)
                .ToListAsync();

            var waterBills = await _context.WaterUtilities
                .Where(w => w.TenantId == tenantId)
                .OrderBy(w => w.BillingMonth)
                .ToListAsync();

            var rentBills = await _context.RentUtilities
                .Where(r => r.TenantId == tenantId)
                .OrderBy(r => r.BillingMonth)
                .ToListAsync();

            using var workbook = new XLWorkbook();

            var headers = new[] { "Billing Month", "Issue Date", "Due Date", "Total Amount", "Remaining Amount", "Is Obsolete" };

            void BuildSheet<T>(string sheetName, IEnumerable<T> bills, Func<T, object[]> rowMapper)
            {
                var ws = workbook.Worksheets.Add(sheetName);

                for (int i = 0; i < headers.Length; i++)
                {
                    var cell = ws.Cell(1, i + 1);
                    cell.Value = headers[i];
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.FontColor = XLColor.White;
                    cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#002365");
                }

                int row = 2;
                foreach (var bill in bills)
                {
                    var values = rowMapper(bill);
                    for (int col = 0; col < values.Length; col++)
                        ws.Cell(row, col + 1).Value = XLCellValue.FromObject(values[col]);
                    row++;
                }

                ws.Columns().AdjustToContents();
            }

            BuildSheet("Electricity Bills", electricityBills, e => new object[]
            {
                e.BillingMonth,
                e.IssueDate.ToString("yyyy-MM-dd"),
                e.DueDate.ToString("yyyy-MM-dd"),
                e.TotalAmount,
                e.RemainingAmount,
                e.IsObsolete ? "Yes" : "No"
            });

            BuildSheet("Water Bills", waterBills, w => new object[]
            {
                w.BillingMonth,
                w.IssueDate.ToString("yyyy-MM-dd"),
                w.DueDate.ToString("yyyy-MM-dd"),
                w.TotalAmount,
                w.RemainingAmount,
                w.IsObsolete ? "Yes" : "No"
            });

            BuildSheet("Rent Bills", rentBills, r => new object[]
            {
                r.BillingMonth,
                r.IssueDate.ToString("yyyy-MM-dd"),
                r.DueDate.ToString("yyyy-MM-dd"),
                r.TotalAmount,
                r.RemainingAmount,
                r.IsObsolete ? "Yes" : "No"
            });

            using var memoryStream = new MemoryStream();
            workbook.SaveAs(memoryStream);
            return memoryStream.ToArray();
        }

        public async Task<byte[]> GetOutstandingReportAsync()
        {
            var tenants = await _context.Tenants
                .Where(t => t.Status == "Active")
                .OrderBy(t => t.Company)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var ws = workbook.Worksheets.Add("Outstanding Report");

            // Header row
            var headers = new[]
            {
                "Tenant ID", "Company", "Electricity Outstanding",
                "Water Outstanding", "Rent Outstanding", "Total Outstanding"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                var cell = ws.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#002365");
            }

            // Data rows
            for (int i = 0; i < tenants.Count; i++)
            {
                var row = i + 2;
                var t = tenants[i];
                var total = t.ElectricityOutstanding + t.WaterOutstanding + t.RentOutstanding;

                ws.Cell(row, 1).Value = t.Id;
                ws.Cell(row, 2).Value = t.Company;
                ws.Cell(row, 3).Value = t.ElectricityOutstanding;
                ws.Cell(row, 4).Value = t.WaterOutstanding;
                ws.Cell(row, 5).Value = t.RentOutstanding;
                ws.Cell(row, 6).Value = total;
            }

            // Total row
            int totalRow = tenants.Count + 2;
            int lastDataRow = tenants.Count + 1;

            ws.Cell(totalRow, 1).Value = "TOTAL";
            ws.Cell(totalRow, 2).Value = String.Empty;
            ws.Cell(totalRow, 3).FormulaA1 = $"=SUM(C2:C{lastDataRow})";
            ws.Cell(totalRow, 4).FormulaA1 = $"=SUM(D2:D{lastDataRow})";
            ws.Cell(totalRow, 5).FormulaA1 = $"=SUM(E2:E{lastDataRow})";
            ws.Cell(totalRow, 6).FormulaA1 = $"=SUM(F2:F{lastDataRow})";

            var totalRowRange = ws.Range(totalRow, 1, totalRow, headers.Length);
            totalRowRange.Style.Font.Bold = true;
            totalRowRange.Style.Font.FontColor = XLColor.White;
            totalRowRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#002365");

            ws.Columns().AdjustToContents();

            using var memoryStream = new MemoryStream();
            workbook.SaveAs(memoryStream);
            return memoryStream.ToArray();
        }

        public async Task<byte[]> GetReceivablesReportAsync()
        {
            var electricityReceivables = await _context.ElectricityUtilities
                .Include(e => e.Tenant)
                .Where(e => !e.IsObsolete && e.RemainingAmount > 0)
                .Select(e => new
                {
                    Tenant = e.Tenant.Company,
                    Type = "Electricity",
                    e.BillingMonth,
                    e.TotalAmount,
                    e.RemainingAmount,
                    e.DueDate
                })
                .ToListAsync();

            var waterReceivables = await _context.WaterUtilities
                .Include(w => w.Tenant)
                .Where(w => !w.IsObsolete && w.RemainingAmount > 0)
                .Select(w => new
                {
                    Tenant = w.Tenant.Company,
                    Type = "Water",
                    w.BillingMonth,
                    w.TotalAmount,
                    w.RemainingAmount,
                    w.DueDate
                })
                .ToListAsync();

            var rentReceivables = await _context.RentUtilities
                .Include(r => r.Tenant)
                .Where(r => !r.IsObsolete && r.RemainingAmount > 0)
                .Select(r => new
                {
                    Tenant = r.Tenant.Company,
                    Type = "Rent",
                    r.BillingMonth,
                    r.TotalAmount,
                    r.RemainingAmount,
                    r.DueDate
                })
                .ToListAsync();

            var allReceivables = electricityReceivables
                .Concat(waterReceivables)
                .Concat(rentReceivables)
                .OrderBy(r => r.Tenant)
                .ThenBy(r => r.Type)
                .ThenBy(r => r.BillingMonth)
                .ToList();

            using var workbook = new XLWorkbook();
            var ws = workbook.Worksheets.Add("Receivables");

            // Header row
            var headers = new[]
            {
                "Tenant", "Type", "Billing Month", "Total Amount", "Remaining Amount", "Due Date"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                var cell = ws.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#002365");
            }

            // Data rows
            for (int i = 0; i < allReceivables.Count; i++)
            {
                var row = i + 2;
                var r = allReceivables[i];

                ws.Cell(row, 1).Value = r.Tenant;
                ws.Cell(row, 2).Value = r.Type;
                ws.Cell(row, 3).Value = r.BillingMonth;
                ws.Cell(row, 4).Value = r.TotalAmount;
                ws.Cell(row, 5).Value = r.RemainingAmount;
                ws.Cell(row, 6).Value = r.DueDate.ToString("yyyy-MM-dd");
            }

            // Total row
            int totalRow = allReceivables.Count + 2;
            int lastDataRow = allReceivables.Count + 1;

            ws.Cell(totalRow, 1).Value = "TOTAL";
            ws.Cell(totalRow, 2).Value = String.Empty;
            ws.Cell(totalRow, 3).Value = String.Empty;
            ws.Cell(totalRow, 4).FormulaA1 = $"=SUM(D2:D{lastDataRow})";
            ws.Cell(totalRow, 5).FormulaA1 = $"=SUM(E2:E{lastDataRow})";
            ws.Cell(totalRow, 6).Value = String.Empty;

            var totalRowRange = ws.Range(totalRow, 1, totalRow, headers.Length);
            totalRowRange.Style.Font.Bold = true;
            totalRowRange.Style.Font.FontColor = XLColor.White;
            totalRowRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#002365");

            ws.Columns().AdjustToContents();

            using var memoryStream = new MemoryStream();
            workbook.SaveAs(memoryStream);
            return memoryStream.ToArray();
        }

        public async Task<byte[]> GetUserAmountsReportAsync()
        {
            var now = DateTime.UtcNow;
            var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var monthEnd = monthStart.AddMonths(1);

            var managers = await _context.Users
                .Where(u => u.Role == "Manager")
                .OrderBy(u => u.Name)
                .ToListAsync();

            var managerUsernames = managers.Select(u => u.Name).ToHashSet();

            var electricityPayments = await _context.ElectricityBills
                .Where(b => managerUsernames.Contains(b.CreatedBy)
                        && b.CreatedAt >= monthStart
                        && b.CreatedAt < monthEnd)
                .GroupBy(b => b.CreatedBy)
                .Select(g => new { Username = g.Key, Total = g.Sum(b => b.Amount) })
                .ToListAsync();

            var waterPayments = await _context.WaterBills
                .Where(b => managerUsernames.Contains(b.CreatedBy)
                        && b.CreatedAt >= monthStart
                        && b.CreatedAt < monthEnd)
                .GroupBy(b => b.CreatedBy)
                .Select(g => new { Username = g.Key, Total = g.Sum(b => b.Amount) })
                .ToListAsync();

            var rentPayments = await _context.RentBills
                .Where(b => managerUsernames.Contains(b.CreatedBy)
                        && b.CreatedAt >= monthStart
                        && b.CreatedAt < monthEnd)
                .GroupBy(b => b.CreatedBy)
                .Select(g => new { Username = g.Key, Total = g.Sum(b => b.Amount) })
                .ToListAsync();

            var electricityMap = electricityPayments.ToDictionary(x => x.Username, x => x.Total);
            var waterMap       = waterPayments.ToDictionary(x => x.Username, x => x.Total);
            var rentMap        = rentPayments.ToDictionary(x => x.Username, x => x.Total);

            using var workbook = new XLWorkbook();
            var ws = workbook.Worksheets.Add("User Collections");

            // Header row
            var headers = new[]
            {
                "Username", "Electricity Collected", "Water Collected", "Rent Collected", "Total"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                var cell = ws.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#002365");
            }

            // Data rows
            for (int i = 0; i < managers.Count; i++)
            {
                var row      = i + 2;
                var username = managers[i].Name;

                var electricity = electricityMap.GetValueOrDefault(username, 0m);
                var water       = waterMap.GetValueOrDefault(username, 0m);
                var rent        = rentMap.GetValueOrDefault(username, 0m);
                var total       = electricity + water + rent;

                ws.Cell(row, 1).Value = username;
                ws.Cell(row, 2).Value = electricity;
                ws.Cell(row, 3).Value = water;
                ws.Cell(row, 4).Value = rent;
                ws.Cell(row, 5).Value = total;
            }

            // Total row
            int totalRow    = managers.Count + 2;
            int lastDataRow = managers.Count + 1;

            ws.Cell(totalRow, 1).Value     = "TOTAL";
            ws.Cell(totalRow, 2).FormulaA1 = $"=SUM(B2:B{lastDataRow})";
            ws.Cell(totalRow, 3).FormulaA1 = $"=SUM(C2:C{lastDataRow})";
            ws.Cell(totalRow, 4).FormulaA1 = $"=SUM(D2:D{lastDataRow})";
            ws.Cell(totalRow, 5).FormulaA1 = $"=SUM(E2:E{lastDataRow})";

            var totalRowRange = ws.Range(totalRow, 1, totalRow, headers.Length);
            totalRowRange.Style.Font.Bold = true;
            totalRowRange.Style.Font.FontColor = XLColor.White;
            totalRowRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#002365");

            ws.Columns().AdjustToContents();

            using var memoryStream = new MemoryStream();
            workbook.SaveAs(memoryStream);
            return memoryStream.ToArray();
        }

    }
}