using Backend.DTOs;
namespace Backend.Interfaces
{
    public interface ITenantService
    {
        Task<List<TenantResponseDto>> GetAllTenantsAsync();
        Task<TenantResponseDto?> GetTenantByIdAsync(int id);
        Task<int> CreateTenantAsync(CreateTenantDto dto);
        Task<bool> UpdateTenantAsync(int id, UpdateTenantDto dto);

        Task<List<TenantResponseDto>> GetInactiveTenantsAsync();

        Task<bool> DeactivateTenantAsync(int id);
        Task<bool> CreateReAgreementAsync(int tenantId, ReAgreementDto dto);
        Task<List<ReAgreementResponseDto>> GetReAgreementsAsync(int tenantId);
    }
}