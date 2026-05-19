


using Backend.DTOs;
namespace Backend.Interfaces
{
    public interface IRentUtilityService
    {
        Task<PagedResultDto<AllBillsResponseDto>> GetAllAsync(int tenantId, int pageNumber, int pageSize, string? month = null);
        Task<PagedResultDto<AllBillsResponseDto>> GetMineAsync(int userId, int pageNumber, int pageSize, string? month = null);
        Task<RentUtilityResponseDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(CreateRentUtilityDto dto);
        Task<RentUtilityResponseDto?> GetCurrentByTenantAsync(int tenantId);
    }
}