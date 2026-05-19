using Backend.DTOs;
namespace Backend.Interfaces
{
    public interface IWaterUtilityService
    {
        Task<PagedResultDto<AllBillsResponseDto>> GetAllAsync(int tenantId, int pageNumber, int pageSize, string? month);
        Task<PagedResultDto<AllBillsResponseDto>> GetMineAsync(int userId, int pageNumber, int pageSize, string? month);
        Task<WaterUtilityResponseDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(CreateWaterUtilityDto dto);
        Task<WaterUtilityResponseDto?> GetCurrentByTenantAsync(int tenantId);
    }
}