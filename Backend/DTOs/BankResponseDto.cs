

namespace Backend.DTOs
{
    public class BankResponseDto
    {
        public int Id { get; set; }
        public string BankName { get; set; } = String.Empty;
        public string AccountNumber { get; set; } = String.Empty;
        public string AccountTitle { get; set; } = String.Empty;
        public decimal OpeningBalance { get; set; }
        public decimal CurrentBalance { get; set; }
        public DateTime OpeningDate { get; set; }
        public bool IsDeleted { get; set; }
    }
}