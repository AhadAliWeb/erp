using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class UtilityConfigService : IUtilityConfigService
    {
        private readonly AppDbContext _context;

        public UtilityConfigService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UtilityConfigResponseDto> GetElectricityConfigAsync()
        {
            var config = await _context.UtilityConfigs.FirstOrDefaultAsync();
            if (config == null) throw new Exception("Utility configuration not found.");

            return new UtilityConfigResponseDto
            {
                Id = config.Id,
                RatePerUnit = config.RatePerUnit,
                FixedCharges = config.FixedCharges,
                SSTPercentage = config.SSTPercentage,
                OverdueSurchargePercentage = config.OverdueSurchargePercentage,
                UpdatedAt = config.UpdatedAt,
                // UpdatedBy = $"{config.UpdatedBy.Name} ({config.UpdatedBy})",
            };
        }

        public async Task<bool> UpdateElectricityConfigAsync(UpdateUtilityConfigDto dto, int userId)
        {
            var config = await _context.UtilityConfigs.FirstOrDefaultAsync();
            if (config == null) throw new Exception("Utility configuration not found.");

            config.RatePerUnit = dto.RatePerUnit;
            config.FixedCharges = dto.FixedCharges;
            config.SSTPercentage = dto.SSTPercentage;
            config.OverdueSurchargePercentage = dto.OverdueSurchargePercentage;
            config.UpdatedAt = DateTime.UtcNow;

            _context.UtilityConfigs.Update(config);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<UtilityConfigResponseDto> GetWaterConfigAsync()
        {
            var config = await _context.WaterUtilityConfigs.FirstOrDefaultAsync();
            if (config == null) throw new Exception("Utility configuration not found.");

            return new UtilityConfigResponseDto
            {
                Id = config.Id,
                RatePerUnit = config.RatePerUnit,
                FixedCharges = config.FixedCharges,
                SSTPercentage = config.SSTPercentage,
                OverdueSurchargePercentage = config.OverdueSurchargePercentage,
                UpdatedAt = config.UpdatedAt,
                // UpdatedBy = $"{config.UpdatedBy.Name} ({config.UpdatedBy})",
            };
        }

        public async Task<bool> UpdateWaterConfigAsync(UpdateUtilityConfigDto dto, int userId)
        {
            var config = await _context.WaterUtilityConfigs.FirstOrDefaultAsync();
            if (config == null) throw new Exception("Utility configuration not found.");

            config.RatePerUnit = dto.RatePerUnit;
            config.FixedCharges = dto.FixedCharges;
            config.SSTPercentage = dto.SSTPercentage;
            config.OverdueSurchargePercentage = dto.OverdueSurchargePercentage;
            config.UpdatedAt = DateTime.UtcNow;

            _context.WaterUtilityConfigs.Update(config);
            await _context.SaveChangesAsync();
            return true;

        }
        
        public async Task<UtilityCompanyDetailsDto> GetUtilityCompanyDetailsAsync(int tenantId)
        {

            var electUtility = await _context.ElectricityUtilities
                .Where(e => e.TenantId == tenantId)
                .OrderByDescending(e => e.CreatedAt)
                .FirstOrDefaultAsync();
            
            var waterUtility = await _context.WaterUtilities
                .Where(w => w.TenantId == tenantId)
                .OrderByDescending(w => w.CreatedAt)
                .FirstOrDefaultAsync();

            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenant == null) throw new Exception("Tenant not found.");

            return new UtilityCompanyDetailsDto
            {
                TenantId = tenant.Id,
                Company = tenant.Company,
                Address = tenant.Address,
                MonthlyRent = tenant.MonthlyRent,
                ElectricityPreviousReading = electUtility?.CurrentReading ?? 0,
                WaterPreviousReading = waterUtility?.CurrentReading ?? 0,
                ElectricityOutstanding = tenant.ElectricityOutstanding,
                WaterOutstanding = tenant.WaterOutstanding,
                RentOutstanding = tenant.RentOutstanding
            };
        }

    }
}