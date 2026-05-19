namespace Backend.DTOs
{
    public class BankTransactionResponseDto
    {
        public int Id { get; set; }
        public int BankId { get; set; }
        public string BankName { get; set; } = String.Empty;
        public string Type { get; set; } = String.Empty;
        public decimal Amount { get; set; }
        public string Description { get; set; } = String.Empty;
        public string CreatedBy { get; set; } = String.Empty;
        public DateTime CreatedAt { get; set; }
    }
}