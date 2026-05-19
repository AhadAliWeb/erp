
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IUtilityConfigService
    {
        Task<UtilityConfigResponseDto> GetElectricityConfigAsync();
        Task<bool> UpdateElectricityConfigAsync(UpdateUtilityConfigDto dto, int userId);
        Task<UtilityConfigResponseDto> GetWaterConfigAsync();
        Task<bool> UpdateWaterConfigAsync(UpdateUtilityConfigDto dto, int userId);

        Task<UtilityCompanyDetailsDto> GetUtilityCompanyDetailsAsync(int tenantId);
    }
}