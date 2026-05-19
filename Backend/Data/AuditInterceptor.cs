using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using Backend.Models;

namespace Backend.Data
{
    public class AuditInterceptor : SaveChangesInterceptor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditInterceptor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            if (eventData.Context is AppDbContext context)
                await AuditAsync(context);

            return await base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private async Task AuditAsync(AppDbContext context)
        {
            // ── Get current user from JWT ─────────────────────
            var httpContext = _httpContextAccessor.HttpContext;
            var userIdStr = httpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            var userName = httpContext?.User?.FindFirstValue(ClaimTypes.Name) ?? "System";
            int.TryParse(userIdStr, out int userId);

            // ── Entities to audit ─────────────────────────────
            var auditableTypes = new[]
            {
                typeof(Tenant), typeof(Bank), typeof(ElectricityUtility),
                typeof(WaterUtility), typeof(RentUtility), typeof(ElectricityBill),
                typeof(WaterBill), typeof(RentBill), typeof(ProductionCommission),
                typeof(ProductionVoucher), typeof(TenantReAgreement)
            };

            var entries = context.ChangeTracker.Entries()
                .Where(e => auditableTypes.Contains(e.Entity.GetType())
                         && e.State is EntityState.Added
                                    or EntityState.Modified
                                    or EntityState.Deleted)
                .ToList();

            foreach (var entry in entries)
            {
                // ── Determine action ──────────────────────────
                var action = entry.State switch
                {
                    EntityState.Added    => "Created",
                    EntityState.Modified => "Updated",
                    EntityState.Deleted  => "Deleted",
                    _                   => "Unknown"
                };

                // ── Get entity ID ─────────────────────────────
                var entityId = 0;
                if (entry.Properties.FirstOrDefault(p => p.Metadata.Name == "Id")?.CurrentValue is int id)
                    entityId = id;

                // ── Capture JSON snapshot ─────────────────────
                // For deleted: use original values. For others: use current values.
                var values = entry.State == EntityState.Deleted
                    ? entry.OriginalValues.Properties
                        .ToDictionary(p => p.Name, p => entry.OriginalValues[p])
                    : entry.CurrentValues.Properties
                        .ToDictionary(p => p.Name, p => entry.CurrentValues[p]);

                var details = JsonSerializer.Serialize(values, new JsonSerializerOptions
                {
                    WriteIndented = false
                });

                // ── Create AuditLog record ────────────────────
                context.AuditLogs.Add(new AuditLog
                {
                    UserId = userId,
                    Action = action,
                    Entity = entry.Entity.GetType().Name,
                    EntityId = entityId.ToString(),
                    Details = details,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }
    }
}