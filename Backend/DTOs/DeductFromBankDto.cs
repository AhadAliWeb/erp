
namespace Backend.DTOs
{
    public class DeductFromBankDto
    {
        public int BankId { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = String.Empty;
    }
}