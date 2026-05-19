

namespace Backend.DTOs
{
    public class CreateTenantDto
    {
        public string Company { get; set; } = String.Empty;
        public string Address { get; set; } = String.Empty;
        public string Category { get; set; } = String.Empty;
        public string ContactPerson { get; set; } = String.Empty;
        public string ContactNumber { get; set; } = String.Empty;
        public decimal MonthlyRent { get; set; }
        public decimal IncrementPercentage { get; set; }
        public DateTime AgreementDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}