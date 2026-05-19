namespace Backend.DTOs
{
    public class CreateProductionCommissionDto
    {
        public int TenantId { get; set; }
        public int SlipFrom { get; set; }
        public int SlipTo { get; set; }
        public decimal RatePerKg { get; set; }
    }
}