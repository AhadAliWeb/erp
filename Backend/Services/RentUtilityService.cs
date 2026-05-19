using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using DocumentFormat.OpenXml.Bibliography;

namespace Backend.Services
{
    public class RentUtilityService : IRentUtilityService
    {
        private readonly AppDbContext _context;

        public RentUtilityService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int> CreateAsync(CreateRentUtilityDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            var tenant = await _context.Tenants.FindAsync(dto.TenantId);
            if (tenant == null || tenant.Status != "Active")
                throw new InvalidOperationException("Tenant not found or inactive");

            var duplicate = await _context.RentUtilities
                .AnyAsync(r => r.TenantId == dto.TenantId
                            && r.BillingMonth == dto.BillingMonth
                            && !r.IsObsolete);
            if (duplicate)
                throw new InvalidOperationException("Bill already exists for this tenant and billing month");

            var arrears = tenant.RentOutstanding;

            var totalAmount = tenant.MonthlyRent + tenant.RentOutstanding;



            await _context.RentUtilities
                .Where(r => r.TenantId == dto.TenantId && !r.IsObsolete)
                .ExecuteUpdateAsync(r => r.SetProperty(x => x.IsObsolete, true));

            var utility = new RentUtility
            {
                TenantId = dto.TenantId,
                BillingMonth = dto.BillingMonth,
                RentAmount = tenant.MonthlyRent,
                Arrears = arrears,
                TotalAmount = totalAmount,
                RemainingAmount = totalAmount,
                DueDate = dto.DueDate,
                IssueDate = DateTime.UtcNow,
                IsObsolete = false,
                OverdueAmountAdded = false,
                Status = "Unpaid",
                CreatedAt = DateTime.UtcNow
            };

            _context.RentUtilities.Add(utility);
            tenant.RentOutstanding += totalAmount;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return utility.Id;
        }

        public async Task<PagedResultDto<AllBillsResponseDto>> GetAllAsync(int tenantId, int pageNumber, int pageSize, string? month = null)
        {
            var query = _context.RentUtilities.AsQueryable();

            if(tenantId > 0)
            {
                query = query.Where(r => r.TenantId == tenantId);
            }

            if (!string.IsNullOrEmpty(month))
            {
                query = query.Where(r => r.BillingMonth == month);
            }

            var totalCount = await query.CountAsync();

            var data = await query
                .Include(r => r.Tenant)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new AllBillsResponseDto
                {
                    Id = r.Id,
                    BillingMonth = r.BillingMonth,
                    TotalAmount = r.TotalAmount,
                    IssueDate = r.IssueDate,
                    DueDate = r.DueDate,
                    Status = r.Status,
                }).ToListAsync();
            
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
            var query = _context.RentUtilities.AsQueryable();

            if(tenantId > 0)
            {
                query = query.Where(r => r.TenantId == tenantId);
            }

            if (!string.IsNullOrEmpty(month))
            {
                query = query.Where(r => r.BillingMonth == month);
            }

            var totalCount = await query.CountAsync();

            var data = await query
                .Include(r => r.Tenant)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new AllBillsResponseDto
                {
                    Id = r.Id,
                    BillingMonth = r.BillingMonth,
                    TotalAmount = r.TotalAmount,
                    IssueDate = r.IssueDate,
                    DueDate = r.DueDate,
                    Status = r.Status,
                }).ToListAsync();
            
            return new PagedResultDto<AllBillsResponseDto>
            {
                Data = data,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
            };
        }


        public async Task<RentUtilityResponseDto?> GetByIdAsync(int id)
        {
            var utility = await _context.RentUtilities
                .Include(r => r.Tenant)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (utility == null) return null;

            return new RentUtilityResponseDto
            {
                Id = utility.Id,
                TenantId = utility.TenantId,
                CompanyName = utility.Tenant.Company,
                BillingMonth = utility.BillingMonth,
                RentAmount = utility.RentAmount,
                Arrears = utility.Arrears,
                TotalAmount = utility.TotalAmount,
                RemainingAmount = utility.RemainingAmount,
                DueDate = utility.DueDate,
                IssueDate = utility.IssueDate,
                IsObsolete = utility.IsObsolete,
                Status = utility.Status,
                OverdueAmountAdded = utility.OverdueAmountAdded,
                CreatedAt = utility.CreatedAt
            };
        }

        public async Task<RentUtilityResponseDto?> GetCurrentByTenantAsync(int tenantId)
        {
            var utility = await _context.RentUtilities
                .Include(r => r.Tenant)
                .Where(r => r.TenantId == tenantId && !r.IsObsolete)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();

            if (utility == null) return null;

            return new RentUtilityResponseDto
            {
                 Id = utility.Id,
                TenantId = utility.TenantId,
                CompanyName = utility.Tenant.Company,
                BillingMonth = utility.BillingMonth,
                RentAmount = utility.RentAmount,
                Arrears = utility.Arrears,
                TotalAmount = utility.TotalAmount,
                RemainingAmount = utility.RemainingAmount,
                DueDate = utility.DueDate,
                IssueDate = utility.IssueDate,
                IsObsolete = utility.IsObsolete,
                Status = utility.Status,
                OverdueAmountAdded = utility.OverdueAmountAdded,
                CreatedAt = utility.CreatedAt
            };

        }

    }
}
