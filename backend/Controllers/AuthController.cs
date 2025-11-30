// Controllers/AuthController.cs

using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginCredentials credentials)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == credentials.Username);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            if (user.Password != credentials.Password)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var authResponse = new
            {
                token = "fake-jwt-token-" + Guid.NewGuid().ToString(),
                userRole = user.Role,
                userId = user.Id
            };

            return Ok(authResponse);
        }
    }
}