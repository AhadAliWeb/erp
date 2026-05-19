

namespace Backend.DTOs
{
    public class ReAgreementResponseDto
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public decimal MonthlyRent { get; set; }
        public decimal YearlyIncrement { get; set; }
        public DateTime AgreementDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}