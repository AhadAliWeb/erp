

using Backend.DTOs;
namespace Backend.Interfaces
{
    public interface IElectricityUtilityService
    {
        Task<PagedResultDto<AllBillsResponseDto>> GetAllAsync(int tenantId, int pageNumber, int pageSize, string? month);

        Task<PagedResultDto<AllBillsResponseDto>> GetMineAsync(int userId, int pageNumber, int pageSize, string? month);
        Task<ElectricityUtilityResponseDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(CreateElectricityUtilityDto dto);
        Task<ElectricityUtilityResponseDto?> GetCurrentByTenantAsync(int tenantId);


    }
}