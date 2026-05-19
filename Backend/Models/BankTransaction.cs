

namespace Backend.Models
{
    public class BankTransaction
    {
        public int Id { get; set; }
        public int BankId { get; set; } // FK to Bank
        public Bank Bank { get; set; } = null!;// Navigation property
        public string Type { get; set; } = String.Empty;
        public decimal Amount { get; set; }
        public string Description { get; set; } = String.Empty;
        public string CreatedBy { get; set; } = String.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}