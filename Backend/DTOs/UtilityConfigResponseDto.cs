
namespace Backend.DTOs
{
    public class UtilityConfigResponseDto
    {
        public int Id { get; set; }
        public decimal RatePerUnit { get; set; }
        public decimal FixedCharges { get; set; }
        public decimal SSTPercentage { get; set; }
        public decimal OverdueSurchargePercentage { get; set; }
        // public string UpdatedBy { get; set; } = String.Empty;
        public DateTime UpdatedAt { get; set; }
    }
}