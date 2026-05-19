
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IBankService
    {
        Task<List<BankResponseDto>> GetAllAsync();
        Task<BankResponseDto> GetByIdAsync(int id);
        Task<int> CreateAsync(CreateBankDto dto);
        Task<bool> DeleteAsync(int id);
        Task<bool> DeductAsync(DeductFromBankDto dto, int userId);

        Task<PagedResultDto<BankTransactionResponseDto>> GetTransactionsAsync(int bankId, int pageNumber, int pageSize, string? type, DateTime? fromDate, DateTime? toDate);
    }
}