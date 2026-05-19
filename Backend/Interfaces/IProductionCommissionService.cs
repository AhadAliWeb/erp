using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IProductionCommissionService
    {
        Task<int> CreateCommissionAsync(CreateProductionCommissionDto dto, int userId);
        Task<int> CreateVoucherAsync(CreateProductionVoucherDto dto, int userId);
        Task<int> AddSlipAsync(CreateProductionSlipDto dto);
        Task<PagedResultDto<ProductionSlipResponseDto>> GetSlipsByTenantAsync(int tenantId, int pageNumber, int pageSize, bool? isUsed);
        Task<ProductionCommissionResponseDto?> GetCommissionByIdAsync(int id);
        Task<ProductionVoucherResponseDto?> GetVoucherByIdAsync(int id);
        Task<PagedResultDto<ProductionVoucherResponseDto>> GetVouchersByTenantAsync(int tenantId, int pageNumber, int pageSize, DateTime? fromDate, DateTime? toDate);
    }
}