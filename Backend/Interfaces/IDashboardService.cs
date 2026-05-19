using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IDashboardService
    {
        Task<TenantDashboardDto> GetTenantDashboardAsync(int tenantId);
        Task<ManagerDashboardDto> GetManagerDashboardAsync(int userId);

        Task<AdminDashboardDto> GetAdminDashboardAsync();


    }
}