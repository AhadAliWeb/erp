namespace Backend.Models
{
    public class Tenant
    {
        public int Id { get; set; }
        public string Company { get; set; } = String.Empty;
        public string Address { get; set; } = String.Empty; 

        public string Category { get; set; } = String.Empty; // Land or Building

        public string ContactPerson { get; set; } = String.Empty;
        public string ContactNumber { get; set; } = String.Empty;

        public decimal MonthlyRent { get; set; }

        public decimal IncrementPercentage { get; set; }

        public DateTime AgreementDate { get; set; }

        public DateTime EndDate { get; set; }

        public decimal ElectricityOutstanding { get; set; }

        public decimal WaterOutstanding { get; set; }

        public decimal RentOutstanding { get; set; }

        public bool RentUpdated { get; set; } = false;

        public string Status { get; set; } = "Active"; // Active, Inactive, Terminated

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;



    }
}