

using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;


namespace Backend.Services
{
    public class ProductionCommissionService : IProductionCommissionService
    {
        private readonly AppDbContext _context;

        public ProductionCommissionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int> CreateCommissionAsync(CreateProductionCommissionDto dto, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            var tenant = await _context.Tenants.FindAsync(dto.TenantId);
            if (tenant == null || tenant.Status != "Active")
                throw new InvalidOperationException("Tenant not found or inactive");

            var slips = await _context.ProductionSlips
                .Where(s => s.TenantId == dto.TenantId
                        && s.SlipNumber >= dto.SlipFrom
                        && s.SlipNumber <= dto.SlipTo)
                .ToListAsync();

            if (!slips.Any())
                throw new InvalidOperationException("No slips found in the given range");

            if (slips.Any(s => s.IsUsed))
                throw new InvalidOperationException("One or more slips in this range are already used");

            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new InvalidOperationException("User not found");

            var totalWeight = slips.Sum(s => s.Weight);
            var totalAmount = totalWeight * dto.RatePerKg;

            foreach (var slip in slips)
                slip.IsUsed = true;

            var commission = new ProductionCommission
            {
                TenantId = dto.TenantId,
                SlipFrom = dto.SlipFrom,
                SlipTo = dto.SlipTo,
                TotalWeight = totalWeight,
                RatePerKg = dto.RatePerKg,
                TotalAmount = totalAmount,
                CreatedBy = $"{user.Name} - {userId}",
                CreatedAt = DateTime.UtcNow
            };

            _context.ProductionCommissions.Add(commission);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return commission.Id;
        }

        public async Task<int> CreateVoucherAsync(CreateProductionVoucherDto dto, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            var commission = await _context.ProductionCommissions.FindAsync(dto.ProductionCommissionId);
            if (commission == null)
                throw new InvalidOperationException("Commission not found");

            var existing = await _context.ProductionVouchers
                .AnyAsync(v => v.ProductionCommissionId == dto.ProductionCommissionId);
            if (existing)
                throw new InvalidOperationException("Voucher already exists for this commission");

            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new InvalidOperationException("User not found");

            var voucher = new ProductionVoucher
            {
                TenantId = commission.TenantId,
                ProductionCommissionId = commission.Id,
                TotalAmount = commission.TotalAmount,
                ModeOfPayment = dto.ModeOfPayment,
                ChequeNo = dto.ChequeNo,
                PayOrderNo = dto.PayOrderNo,
                BankId = dto.BankId,
                CreatedBy = $"{user.Name} - {userId}",
                CreatedAt = DateTime.UtcNow
            };

            _context.ProductionVouchers.Add(voucher);

            if (dto.BankId.HasValue)
            {
                var bank = await _context.Banks.FindAsync(dto.BankId.Value);
                if (bank == null || bank.IsDeleted)
                    throw new InvalidOperationException("Bank not found");

                bank.CurrentBalance -= commission.TotalAmount;

                _context.BankTransactions.Add(new BankTransaction
                {
                    BankId = dto.BankId.Value,
                    Type = "Debit",
                    Amount = commission.TotalAmount,
                    Description = $"Production voucher - Commission {commission.Id} - Tenant {commission.TenantId}",
                    CreatedBy = $"{user.Name} - {userId}",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return voucher.Id;
        }

        public async Task<int> AddSlipAsync(CreateProductionSlipDto dto)
        {
            var tenant = await _context.Tenants.FindAsync(dto.TenantId);
            if (tenant == null || tenant.Status != "Active")
                throw new InvalidOperationException("Tenant not found or inactive");

            var duplicate = await _context.ProductionSlips
                .AnyAsync(s => s.TenantId == dto.TenantId && s.SlipNumber == dto.SlipNumber);
            if (duplicate)
                throw new InvalidOperationException("Slip number already exists for this tenant");

            var slip = new ProductionSlip
            {
                TenantId = dto.TenantId,
                SlipNumber = dto.SlipNumber,
                Weight = dto.Weight,
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.ProductionSlips.Add(slip);
            await _context.SaveChangesAsync();

            return slip.Id;
        }

        public async Task<PagedResultDto<ProductionSlipResponseDto>> GetSlipsByTenantAsync(int tenantId, int pageNumber, int pageSize, bool? isUsed)
        {
            var query = _context.ProductionSlips
                .Where(s => s.TenantId == tenantId);

            if (isUsed.HasValue)
                query = query.Where(s => s.IsUsed == isUsed.Value);

            var totalCount = await query.CountAsync();

            var slips = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new ProductionSlipResponseDto
                {
                    Id = s.Id,
                    TenantId = s.TenantId,
                    CompanyName = s.Tenant.Company,
                    SlipNumber = s.SlipNumber,
                    Weight = s.Weight,
                    IsUsed = s.IsUsed,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();

            return new PagedResultDto<ProductionSlipResponseDto>
            {
                Data = slips,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<ProductionCommissionResponseDto?> GetCommissionByIdAsync(int id)
        {
            var commission = await _context.ProductionCommissions
                .Include(c => c.Tenant)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (commission == null) return null;

            return new ProductionCommissionResponseDto
            {
                Id = commission.Id,
                TenantId = commission.TenantId,
                CompanyName = commission.Tenant.Company,
                SlipFrom = commission.SlipFrom,
                SlipTo = commission.SlipTo,
                TotalWeight = commission.TotalWeight,
                RatePerKg = commission.RatePerKg,
                TotalAmount = commission.TotalAmount,
                CreatedBy = commission.CreatedBy,
                CreatedAt = commission.CreatedAt
            };
        }

        public async Task<ProductionVoucherResponseDto?> GetVoucherByIdAsync(int id)
        {
            var voucher = await _context.ProductionVouchers
                .Include(v => v.Tenant)
                .Include(v => v.ProductionCommission)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (voucher == null) return null;

            return new ProductionVoucherResponseDto
            {
                Id = voucher.Id,
                TenantId = voucher.TenantId,
                CompanyName = voucher.Tenant.Company,
                BankName = voucher.BankId.HasValue ? (voucher.Bank.IsDeleted ? "Deleted Bank" : voucher.Bank.BankName) : null,
                ProductionCommissionId = voucher.ProductionCommissionId,
                TotalAmount = voucher.TotalAmount,
                ModeOfPayment = voucher.ModeOfPayment,
                ChequeNo = voucher.ChequeNo,
                PayOrderNo = voucher.PayOrderNo,
                BankId = voucher.BankId,
                CreatedBy = voucher.CreatedBy,
                CreatedAt = voucher.CreatedAt
            };
        }

        public async Task<PagedResultDto<ProductionVoucherResponseDto>> GetVouchersByTenantAsync(int tenantId, int pageNumber, int pageSize, DateTime? fromDate, DateTime? toDate)
        {
            var query = _context.ProductionVouchers
                .Where(v => v.TenantId == tenantId);

            if (fromDate.HasValue)
                query = query.Where(v => v.CreatedAt >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(v => v.CreatedAt <= toDate.Value);

            var totalCount = await query.CountAsync();

            var vouchers = await query
                .OrderByDescending(v => v.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(v => new ProductionVoucherResponseDto
                {
                    Id = v.Id,
                    TenantId = v.TenantId,
                    CompanyName = v.Tenant.Company,
                    ProductionCommissionId = v.ProductionCommissionId,
                    TotalAmount = v.TotalAmount,
                    ModeOfPayment = v.ModeOfPayment,
                    ChequeNo = v.ChequeNo,
                    PayOrderNo = v.PayOrderNo,
                    BankId = v.BankId,
                    CreatedBy = v.CreatedBy,
                    CreatedAt = v.CreatedAt
                })
                .ToListAsync();

            return new PagedResultDto<ProductionVoucherResponseDto>
            {
                Data = vouchers,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

    }
}