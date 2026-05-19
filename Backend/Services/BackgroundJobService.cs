using Backend.Data;
using Hangfire;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class BackgroundJobService
    {
        private readonly AppDbContext _context;

        public BackgroundJobService(AppDbContext context)
        {
            _context = context;
        }

        // ── Job 1: Overdue Surcharge ──────────────────────────
        // Runs daily. Checks all non-obsolete utilities where
        // DueDate has passed and surcharge has not been added yet.
        // Adds surcharge % on RemainingAmount and updates outstanding.
        public async Task ApplyOverdueSurchargeAsync()
        {
            var today = DateTime.UtcNow.Date;

            // ── Electricity ───────────────────────────────────
            var electricityConfig = await _context.UtilityConfigs.FirstOrDefaultAsync();
            if (electricityConfig != null)
            {
                // Get all overdue electricity utilities where surcharge not yet applied
                var overdueElectricity = await _context.ElectricityUtilities
                    .Where(e => !e.IsObsolete
                             && !e.OverdueAmountAdded
                             && e.RemainingAmount > 0
                             && e.DueDate.Date < today)
                    .ToListAsync();

                foreach (var utility in overdueElectricity)
                {
                    // Calculate surcharge on remaining amount
                    var surcharge = utility.RemainingAmount *
                                   (electricityConfig.OverdueSurchargePercentage / 100);

                    utility.RemainingAmount += surcharge;
                    utility.TotalAmount += surcharge;
                    utility.OverdueAmountAdded = true;

                    // Sync tenant outstanding
                    var tenant = await _context.Tenants.FindAsync(utility.TenantId);
                    if (tenant != null)
                        tenant.ElectricityOutstanding += surcharge;
                }
            }

            // ── Water ─────────────────────────────────────────
            var waterConfig = await _context.WaterUtilityConfigs.FirstOrDefaultAsync();
            if (waterConfig != null)
            {
                // Get all overdue water utilities where surcharge not yet applied
                var overdueWater = await _context.WaterUtilities
                    .Where(w => !w.IsObsolete
                             && !w.OverdueAmountAdded
                             && w.RemainingAmount > 0
                             && w.DueDate.Date < today)
                    .ToListAsync();

                foreach (var utility in overdueWater)
                {
                    var surcharge = utility.RemainingAmount *
                                   (waterConfig.OverdueSurchargePercentage / 100);

                    utility.RemainingAmount += surcharge;
                    utility.TotalAmount += surcharge;
                    utility.OverdueAmountAdded = true;

                    var tenant = await _context.Tenants.FindAsync(utility.TenantId);
                    if (tenant != null)
                        tenant.WaterOutstanding += surcharge;
                }
            }

            // ── Rent ──────────────────────────────────────────
            // Rent uses water config surcharge % as per spec
            var overdueRent = await _context.RentUtilities
                .Where(r => !r.IsObsolete
                         && !r.OverdueAmountAdded
                         && r.RemainingAmount > 0
                         && r.DueDate.Date < today)
                .ToListAsync();

            foreach (var utility in overdueRent)
            {
                // Get surcharge % from electricity config for rent
                var surchargePercent = electricityConfig?.OverdueSurchargePercentage ?? 0;
                var surcharge = utility.RemainingAmount * (surchargePercent / 100);

                utility.RemainingAmount += surcharge;
                utility.TotalAmount += surcharge;
                utility.OverdueAmountAdded = true;

                var tenant = await _context.Tenants.FindAsync(utility.TenantId);
                if (tenant != null)
                    tenant.RentOutstanding += surcharge;
            }

            await _context.SaveChangesAsync();
        }

        // ── Job 2: Yearly Rent Increment ──────────────────────
        // Runs daily but only applies increment once per year.
        // Checks if today matches tenant's AgreementDate anniversary
        // and RentUpdated = false. Applies IncrementPercentage to MonthlyRent.
        public async Task ApplyYearlyRentIncrementAsync()
        {
            var today = DateTime.UtcNow.Date;

            // Get all active tenants where increment not yet applied this year
            var tenants = await _context.Tenants
                .Where(t => t.Status == "Active" && !t.RentUpdated)
                .ToListAsync();

            foreach (var tenant in tenants)
            {
                // Check if today matches the anniversary of AgreementDate
                // (same day and month as agreement date)
                var agreementAnniversary = new DateTime(
                    today.Year,
                    tenant.AgreementDate.Month,
                    tenant.AgreementDate.Day
                );

                if (today == agreementAnniversary)
                {
                    // Apply increment percentage to monthly rent
                    var increment = tenant.MonthlyRent * (tenant.IncrementPercentage / 100);
                    tenant.MonthlyRent += increment;

                    // Mark as updated to prevent double increment
                    tenant.RentUpdated = true;
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}