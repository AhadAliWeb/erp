

using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Services
{
    public class ElectricityUtilityService : IElectricityUtilityService
    {
        private readonly AppDbContext _context;

        public ElectricityUtilityService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int> CreateAsync(CreateElectricityUtilityDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            var tenant = await _context.Tenants.FindAsync(dto.TenantId);
            if (tenant == null || tenant.Status != "Active")
                throw new InvalidOperationException("Tenant not found or inactive");

            var duplicate = await _context.ElectricityUtilities
                .AnyAsync(e => e.TenantId == dto.TenantId 
                            && e.BillingMonth == dto.BillingMonth 
                            && !e.IsObsolete);
            if (duplicate)
                throw new InvalidOperationException("Bill already exists for this tenant and billing month");

            if (dto.CurrentReading <= dto.PreviousReading)
                throw new InvalidOperationException("Current reading must be greater than previous reading");

            var config = await _context.UtilityConfigs.FirstOrDefaultAsync();
            if (config == null)
                throw new InvalidOperationException("Utility config not found");

            var unitsConsumed = dto.CurrentReading - dto.PreviousReading;
            var electricityCharges = unitsConsumed * config.RatePerUnit;
            var sstCharges = electricityCharges * (config.SSTPercentage / 100);
            var totalAmount = electricityCharges + config.FixedCharges + sstCharges;
            var remainingAmount = totalAmount + tenant.ElectricityOutstanding;

            // Obsolete previous bills
            await _context.ElectricityUtilities
                .Where(e => e.TenantId == dto.TenantId && !e.IsObsolete)
                .ExecuteUpdateAsync(e => e.SetProperty(x => x.IsObsolete, true));

            var utility = new ElectricityUtility
            {
                TenantId = dto.TenantId,
                BillingMonth = dto.BillingMonth,
                PreviousReading = dto.PreviousReading,
                CurrentReading = dto.CurrentReading,
                UnitsConsumed = unitsConsumed,
                RatePerUnit = config.RatePerUnit,
                ElectricityCharges = electricityCharges,
                FixedCharges = config.FixedCharges,
                SSTCharges = sstCharges,
                TotalAmount = totalAmount,
                RemainingAmount = remainingAmount,
                DueDate = dto.DueDate,
                IssueDate = DateTime.UtcNow,
                IsObsolete = false,
                OverdueAmountAdded = false,
                CreatedAt = DateTime.UtcNow,
                Status = "Unpaid"
            };

            _context.ElectricityUtilities.Add(utility);

            tenant.ElectricityOutstanding += totalAmount;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return utility.Id;
        }

        public async Task<ElectricityUtilityResponseDto?> GetCurrentByTenantAsync(int tenantId)
        {
            var utility = await _context.ElectricityUtilities
                .Include(e => e.Tenant)
                .Where(e => e.TenantId == tenantId && !e.IsObsolete)
                .OrderByDescending(e => e.CreatedAt)
                .FirstOrDefaultAsync();

            if (utility == null) return null;

            return new ElectricityUtilityResponseDto
            {
                Id = utility.Id,
                TenantId = utility.TenantId,
                CompanyName = utility.Tenant.Company,
                BillingMonth = utility.BillingMonth,
                PreviousReading = utility.PreviousReading,
                CurrentReading = utility.CurrentReading,
                UnitsConsumed = utility.UnitsConsumed,
                RatePerUnit = utility.RatePerUnit,
                ElectricityCharges = utility.ElectricityCharges,
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

        public async Task<ElectricityUtilityResponseDto?> GetByIdAsync(int id)
        {
            var utility = await _context.ElectricityUtilities
                .Include(e => e.Tenant)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (utility == null) return null;

            return new ElectricityUtilityResponseDto
            {
                Id = utility.Id,
                TenantId = utility.TenantId,
                CompanyName = utility.Tenant.Company,
                BillingMonth = utility.BillingMonth,
                PreviousReading = utility.PreviousReading,
                CurrentReading = utility.CurrentReading,
                UnitsConsumed = utility.UnitsConsumed,
                RatePerUnit = utility.RatePerUnit,
                ElectricityCharges = utility.ElectricityCharges,
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

        public async Task<PagedResultDto<AllBillsResponseDto>> GetAllAsync(int tenantId, int pageNumber, int pageSize, string? month)
        {
            var query = _context.ElectricityUtilities.AsQueryable();

            if(tenantId > 0)
            {
                query = query.Where(e => e.TenantId == tenantId);
            }

            if (!string.IsNullOrEmpty(month))
            {
                query = query.Where(e => e.BillingMonth == month);
            }

            var totalCount = await query.CountAsync();

            var data = await query
                .Include(e => e.Tenant)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new AllBillsResponseDto
                {
                    Id = e.Id,
                    BillingMonth = e.BillingMonth,
                    UnitsConsumed = e.UnitsConsumed,
                    TotalAmount = e.TotalAmount,
                    IssueDate = e.IssueDate,
                    DueDate = e.DueDate,
                    Status = e.Status,
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


        public async Task<PagedResultDto<AllBillsResponseDto>> GetMineAsync(int userId, int pageNumber, int pageSize, string? month)
        {
            var tenantId = await _context.Users.Where(u => u.Id == userId).Select(u => u.TenantId).FirstOrDefaultAsync() ?? 0;

            var query = _context.ElectricityUtilities.AsQueryable();

            if (!string.IsNullOrEmpty(month))
            {
                query = query.Where(e => e.TenantId == tenantId);
            }

            if (!string.IsNullOrEmpty(month))
            {
                query = query.Where(e => e.BillingMonth == month);
            }

            var totalCount = await query.CountAsync();

            var data = await query
                .Include(e => e.Tenant)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new AllBillsResponseDto
                {
                    Id = e.Id,
                    BillingMonth = e.BillingMonth,
                    UnitsConsumed = e.UnitsConsumed,
                    TotalAmount = e.TotalAmount,
                    IssueDate = e.IssueDate,
                    DueDate = e.DueDate,
                    Status = e.Status,
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



    }
}