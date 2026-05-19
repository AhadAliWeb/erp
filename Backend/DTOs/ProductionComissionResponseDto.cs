namespace Backend.DTOs
{
    public class ProductionCommissionResponseDto
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string CompanyName { get; set; } = String.Empty;
        public int SlipFrom { get; set; }
        public int SlipTo { get; set; }
        public decimal TotalWeight { get; set; }
        public decimal RatePerKg { get; set; }
        public decimal TotalAmount { get; set; }
        public string CreatedBy { get; set; } = String.Empty;
        public DateTime CreatedAt { get; set; }
    }
}