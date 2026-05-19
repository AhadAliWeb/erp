using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IAuthService
    {
        Task<int> RegisterAsync(RegisterDto registerDto);
        Task<string> LoginAsync(LoginDto loginDto);

        Task<PagedResultDto<UserResponseDto>> GetUsersAsync(int pageNumber, int pageSize, string? search, bool IsActive);
    }
}