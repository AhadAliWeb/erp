
namespace Backend.DTOs
{
    public class UpdateUtilityConfigDto
    {
        public decimal RatePerUnit { get; set; }
        public decimal FixedCharges { get; set; }
        public decimal SSTPercentage { get; set; }
        public decimal OverdueSurchargePercentage { get; set; }
    }
}