

namespace Backend.DTOs
{
    public class CreateBankDto
    {
        public string BankName { get; set; } = String.Empty;
        public string AccountNumber { get; set; } = String.Empty;
        public string AccountTitle { get; set; } = String.Empty;
        public decimal OpeningBalance { get; set; }
        public DateTime OpeningDate { get; set; }
    }
}