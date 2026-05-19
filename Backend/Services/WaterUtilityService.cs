using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Services
{
    public class WaterUtilityService : IWaterUtilityService
    {
        private readonly AppDbContext _context;

        public WaterUtilityService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<int> CreateAsync(CreateWaterUtilityDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            var tenant = await _context.Tenants.FindAsync(dto.TenantId);
            if (tenant == null || tenant.Status != "Active")
                throw new InvalidOperationException("Tenant not found or inactive");

            var duplicate = await _context.WaterUtilities
                .AnyAsync(w => w.TenantId == dto.TenantId
                            && w.BillingMonth == dto.BillingMonth
                            && !w.IsObsolete);
            if (duplicate)
                throw new InvalidOperationException("Bill already exists for this tenant and billing month");

            if (dto.CurrentReading <= dto.PreviousReading)
                throw new InvalidOperationException("Current reading must be greater than previous reading");

            var config = await _context.WaterUtilityConfigs.FirstOrDefaultAsync();
            if (config == null)
                throw new InvalidOperationException("Water utility config not found");

            var unitsConsumed = dto.CurrentReading - dto.PreviousReading;
            var waterCharges = unitsConsumed * config.RatePerUnit;
            var sstCharges = waterCharges * (config.SSTPercentage / 100);
            var totalAmount = waterCharges + config.FixedCharges + sstCharges;
            var remainingAmount = totalAmount + tenant.WaterOutstanding;

            await _context.WaterUtilities
                .Where(w => w.TenantId == dto.TenantId && !w.IsObsolete)
                .ExecuteUpdateAsync(w => w.SetProperty(x => x.IsObsolete, true));

            var utility = new WaterUtility
            {
                TenantId = dto.TenantId,
                BillingMonth = dto.BillingMonth,
                PreviousReading = dto.PreviousReading,
                CurrentReading = dto.CurrentReading,
                UnitsConsumed = unitsConsumed,
                RatePerUnit = config.RatePerUnit,
                WaterCharges = waterCharges,
                FixedCharges = config.FixedCharges,
                SSTCharges = sstCharges,
                TotalAmount = totalAmount,
                RemainingAmount = remainingAmount,
                DueDate = dto.DueDate,
                IssueDate = DateTime.UtcNow,
                IsObsolete = false,
                OverdueAmountAdded = false,
                Status = "Unpaid",
                CreatedAt = DateTime.UtcNow
            };

            _context.WaterUtilities.Add(utility);
            tenant.WaterOutstanding += totalAmount;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return utility.Id;
        }

        public async Task<PagedResultDto<AllBillsResponseDto>> GetAllAsync(int tenantId, int pageNumber, int pageSize, string? month = null)
        {
            var query = _context.WaterUtilities.AsQueryable();

            if(tenantId > 0)
            {
                query = query.Where(w => w.TenantId == tenantId);
            }

            if (!string.IsNullOrEmpty(month))
            {
                query = query.Where(w => w.BillingMonth == month);
            }
            var totalCount = await query.CountAsync();

            var data = await query
                .Include(w => w.Tenant)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(w => new AllBillsResponseDto
                {
                    Id = w.Id,
                    BillingMonth = w.BillingMonth,
                    UnitsConsumed = w.UnitsConsumed,
                    TotalAmount = w.TotalAmount,
                    IssueDate = w.IssueDate,
                    DueDate = w.DueDate,
                    Status = w.Status,
                })
                .ToListAsync();
                
            return new PagedResultDto<AllBillsResponseDto>
            {
                Data = data,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
            };
        }


         public async Task<PagedResultDto<AllBillsResponseDto>> GetMineAsync(int userId, int pageNumber, int pageSize, string? month = null)
        {
            var tenantId = await _context.Users.Where(u => u.Id == userId).Select(u => u.TenantId).FirstOrDefaultAsync() ?? 0;

            var query = _context.WaterUtilities.AsQueryable();

            if(tenantId > 0)
            {
                query = query.Where(w => w.TenantId == tenantId);
            }

            if (!string.IsNullOrEmpty(month))
            {
                query = query.Where(w => w.BillingMonth == month);
            }
            var totalCount = await query.CountAsync();

            var data = await query
                .Include(w => w.Tenant)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(w => new AllBillsResponseDto
                {
                    Id = w.Id,
                    BillingMonth = w.BillingMonth,
                    UnitsConsumed = w.UnitsConsumed,
                    TotalAmount = w.TotalAmount,
                    IssueDate = w.IssueDate,
                    DueDate = w.DueDate,
                    Status = w.Status,
                })
                .ToListAsync();
                
            return new PagedResultDto<AllBillsResponseDto>
            {
                Data = data,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
            };
        }


        public async Task<WaterUtilityResponseDto?> GetByIdAsync(int id)
        {
            var utility = await _context.WaterUtilities
                .Include(w => w.Tenant)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (utility == null) return null;

            return new WaterUtilityResponseDto
            {
                Id = utility.Id,
                TenantId = utility.TenantId,
                CompanyName = utility.Tenant.Company,
                BillingMonth = utility.BillingMonth,
                PreviousReading = utility.PreviousReading,
                CurrentReading = utility.CurrentReading,
                UnitsConsumed = utility.UnitsConsumed,
                RatePerUnit = utility.RatePerUnit,
                WaterCharges = utility.WaterCharges,
                FixedCharges = utility.FixedCharges,
                SSTCharges = utility.SSTCharges,
                TotalAmount = utility.TotalAmount,
                RemainingAmount = utility.RemainingAmount,
                DueDate = utility.DueDate,
                IssueDate = utility.IssueDate,
                IsObsolete = utility.IsObsolete,
                OverdueAmountAdded = utility.OverdueAmountAdded,
                Status = utility.Status,
                CreatedAt = utility.CreatedAt
            };
        }

        public async Task<WaterUtilityResponseDto?> GetCurrentByTenantAsync(int tenantId)
        {
            var utility = await _context.WaterUtilities
                .Include(w => w.Tenant)
                .Where(w => w.TenantId == tenantId && !w.IsObsolete)
                .OrderByDescending(w => w.CreatedAt)
                .FirstOrDefaultAsync();
            if (utility == null) return null;

            return new WaterUtilityResponseDto
            {
                Id = utility.Id,
                TenantId = utility.TenantId,
                CompanyName = utility.Tenant.Company,
                BillingMonth = utility.BillingMonth,
                PreviousReading = utility.PreviousReading,
                CurrentReading = utility.CurrentReading,
                UnitsConsumed = utility.UnitsConsumed,
                RatePerUnit = utility.RatePerUnit,
                WaterCharges = utility.WaterCharges,
                FixedCharges = utility.FixedCharges,
                SSTCharges = utility.SSTCharges,
                TotalAmount = utility.TotalAmount,
                RemainingAmount = utility.RemainingAmount,
                DueDate = utility.DueDate,
                IssueDate = utility.IssueDate,
                IsObsolete = utility.IsObsolete,
                OverdueAmountAdded = utility.OverdueAmountAdded,
                Status = utility.Status,
                CreatedAt = utility.CreatedAt
            };
        }
    }
}