
using Backend.DTOs;


namespace Backend.Interfaces
{
    public interface IBillService
    {
        Task<int> CreatePaymentAsync(CreatePaymentDto dto, int userId);
        Task<PagedResultDto<PaymentResponseDto>> GetPaymentsByTenantAsync(int tenantId, string billType, int pageNumber, int pageSize, string? modeOfPayment = null, string? billingMonth = null);


        Task<PagedResultDto<PaymentResponseDto>> GetMyTenantPaymentsAsync(int userId, string billType, int pageNumber, int pageSize, string? modeOfPayment = null, string? billingMonth = null);



        
        Task<bool> ChequeBounceAsync(ChequeBounceDto dto);
    }
}