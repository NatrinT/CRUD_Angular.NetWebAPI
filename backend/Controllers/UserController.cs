using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<User>>> GetUsers([FromQuery] PaginationRequest request)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(request.Search))
            {
                query = query.Where(u => u.Fullname.Contains(request.Search) || u.Email.Contains(request.Search));
            }

            var totalCount = await query.CountAsync();

            if (request.OrderField == "Id")
            {
                query = request.OrderDirection.ToLower() == "asc"
                    ? query.OrderBy(u => u.Id)
                    : query.OrderByDescending(u => u.Id);
            }

            var users = await query
                .Skip((request.PageNumber - 1) * request.PageSize) // ⬅️ ใช้ request.PageNumber, request.PageSize
                .Take(request.PageSize)
                .ToListAsync();

            var result = new PagedResult<User>
            {
                DataSource = users,
                Page = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = totalCount
            };

            return Ok(result);
        }



        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users
                // ⬇️ ต้องเพิ่ม .Include() เพื่อดึง Permissions
                .Include(u => u.Permissions)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }


        [HttpPost]
        public async Task<ActionResult<User>> CreateUser([FromBody] User newUser)
        {
            if (!ModelState.IsValid) // ใช้ ModelState.IsValid เพื่อตรวจสอบ [Required] และ Validation
            {
                return BadRequest(ModelState);
            }

            if (newUser.Permissions != null)
            {
                Console.WriteLine($"Received {newUser.Permissions.Count} permission items for new user: {newUser.Username}");
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
            }

            return StatusCode(201, newUser);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var userToDelete = await _context.Users.FindAsync(id);

            if (userToDelete == null)
            {
                return NotFound(new { message = $"User with ID {id} not found." });
            }

            try
            {
                var permissionsToDelete = await _context.UserPermissions // <--- ใช้ชื่อ DbSet พหูพจน์
                                        .Where(p => p.UserId == id)
                                        .ToListAsync();

                if (permissionsToDelete.Any())
                {
                    _context.UserPermissions.RemoveRange(permissionsToDelete);
                }

                _context.Users.Remove(userToDelete);

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Deletion failed due to database error: {ex.Message}");
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User updatedUser)
        {
            if (id != updatedUser.Id)
            {
                return BadRequest("User ID mismatch.");
            }

            var existingUser = await _context.Users
                .Include(u => u.Permissions)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (existingUser == null)
            {
                return NotFound();
            }

            var originalPassword = existingUser.Password;
            var originalCreatedDate = existingUser.CreatedDate;

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Entry(existingUser).CurrentValues.SetValues(updatedUser);

            existingUser.CreatedDate = originalCreatedDate;
            _context.Entry(existingUser).Property(u => u.CreatedDate).IsModified = false; // บอก EF ว่าห้ามอัปเดต Field นี้


            if (string.IsNullOrWhiteSpace(updatedUser.Password))
            {
                existingUser.Password = originalPassword;
                _context.Entry(existingUser).Property(u => u.Password!).IsModified = false;
            }
            else
            {
                _context.Entry(existingUser).Property(u => u.Password!).IsModified = true;
            }

            if (existingUser.Permissions != null)
            {
                _context.UserPermissions.RemoveRange(existingUser.Permissions);
                existingUser.Permissions.Clear(); // ล้าง Collection ใน Object ด้วย
            }

            if (updatedUser.Permissions != null)
            {
                foreach (var newPerm in updatedUser.Permissions)
                {
                    newPerm.Id = 0; // 🚨 รีเซ็ต Id เพื่อแก้ปัญหา IDENTITY_INSERT
                    newPerm.UserId = id;
                    _context.UserPermissions.Add(newPerm);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Users.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent(); // 204 No Content
        }
    }
}