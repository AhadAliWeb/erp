using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
// using Hangfire;
// using Hangfire.SqlServer;
using QuestPDF.Infrastructure;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Backend.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<AuditInterceptor>();


// ── Database ──────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
           .AddInterceptors(sp.GetRequiredService<AuditInterceptor>());
});

// ── Identity ──────────────────────────────────────────────
// builder.Services.AddIdentity<User, IdentityRole>(options =>
// {
//     options.Password.RequireDigit = true;
//     options.Password.RequiredLength = 8;
//     options.Password.RequireNonAlphanumeric = false;
// })
// .AddEntityFrameworkStores<AppDbContext>()
// .AddDefaultTokenProviders();



// ── JWT ───────────────────────────────────────────────────
// var jwtSettings = builder.Configuration.GetSection("JwtSettings");
// builder.Services.AddAuthentication(options =>
// {
//     options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//     options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
// })
// .AddJwtBearer(options =>
// {
//     options.TokenValidationParameters = new TokenValidationParameters
//     {
//         ValidateIssuer           = true,
//         ValidateAudience         = true,
//         ValidateLifetime         = true,
//         ValidateIssuerSigningKey = true,
//         ValidIssuer              = jwtSettings["Issuer"],
//         ValidAudience            = jwtSettings["Audience"],
//         IssuerSigningKey         = new SymmetricSecurityKey(
//                                        Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!))
//     };
// });

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

// ── Authorization Policies ────────────────────────────────
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly",          p => p.RequireRole("Admin"));
    options.AddPolicy("ManagerOrAdmin",     p => p.RequireRole("Manager", "Admin"));
    options.AddPolicy("TenantOnly",         p => p.RequireRole("Tenant"));
    options.AddPolicy("AllRoles",           p => p.RequireRole("Admin", "Manager", "Tenant"));
});

// ── CORS ──────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ── Hangfire ──────────────────────────────────────────────
// builder.Services.AddHangfire(config => config
//     .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
//     .UseSimpleAssemblyNameTypeSerializer()
//     .UseRecommendedSerializerSettings()
//     .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));
// builder.Services.AddHangfireServer();

// ── FluentValidation ──────────────────────────────────────
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// ── AutoMapper ────────────────────────────────────────────
// builder.Services.AddAutoMapper(typeof(Program).Assembly);

// ── Services (DI) ─────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITenantService,TenantService>();
builder.Services.AddScoped<IElectricityUtilityService,ElectricityUtilityService>();
builder.Services.AddScoped<IWaterUtilityService,        WaterUtilityService>();
builder.Services.AddScoped<IRentUtilityService,                RentUtilityService>();
builder.Services.AddScoped<IBillService,                BillService>();
builder.Services.AddScoped<IBankService,                BankService>();
builder.Services.AddScoped<IProductionCommissionService,ProductionCommissionService>();
builder.Services.AddScoped<IReportService,              ReportService>();
builder.Services.AddScoped<IDashboardService,           DashboardService>();
builder.Services.AddScoped<IUtilityConfigService,       UtilityConfigService>();
// builder.Services.AddScoped<BackgroundJobService>();
// builder.Services.AddScoped<JwtHelper>();

// ── Swagger ───────────────────────────────────────────────
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "PSFCL API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.ApiKey,
        Scheme       = "Bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "Enter: Bearer {your token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ── QuestPDF License ──────────────────────────────────────
QuestPDF.Settings.License = LicenseType.Community;

builder.Services.AddControllers();

// ═════════════════════════════════════════════════════════
var app = builder.Build();
// ═════════════════════════════════════════════════════════

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
// app.UseHangfireDashboard("/hangfire");

// ── Serve React App ───────────────────────────────────────
app.UseDefaultFiles();   // serves index.html for "/"
app.UseStaticFiles();    // serves JS/CSS/assets from wwwroot

// ── SPA Fallback (for React Router) ──────────────────────
app.MapFallbackToFile("index.html");

// ── Schedule Background Jobs ──────────────────────────────
// RecurringJob.AddOrUpdate<BackgroundJobService>(
//     "overdue-surcharge",
//     job => job.ApplyOverdueSurchargeAsync(),
//     Cron.Daily // runs every day at midnight
// );

// RecurringJob.AddOrUpdate<BackgroundJobService>(
//     "yearly-rent-increment",
//     job => job.ApplyYearlyRentIncrementAsync(),
//     Cron.Daily // runs daily, but logic only fires on anniversary date
// );


app.MapControllers();

app.Run();