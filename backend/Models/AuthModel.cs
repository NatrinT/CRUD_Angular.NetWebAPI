// Models/LoginCredentials.cs

using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class LoginCredentials
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}