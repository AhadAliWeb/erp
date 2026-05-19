namespace Backend.Models
{
    public class UtilityConfig
    {
        public int Id { get; set; }
        public decimal RatePerUnit { get; set; }
        public decimal FixedCharges { get; set; }
        public decimal SSTPercentage { get; set; }
        public decimal OverdueSurchargePercentage { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}