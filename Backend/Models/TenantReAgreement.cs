namespace Backend.Models
{
    public class TenantReAgreement
    {
        public int Id { get; set; }
        public int TenantId { get; set; } // FK to Tenant

        public Tenant Tenant { get; set; } = null!;// Navigation property
        public decimal MonthlyRent { get; set; }
        public decimal YearlyIncrement { get; set; }
        public DateTime AgreementDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}