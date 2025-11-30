using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [JsonPropertyName("fullname")]
        public string Fullname { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [JsonPropertyName("username")]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(256)]
        [JsonPropertyName("password")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        [JsonPropertyName("mobileNo")]
        public string? MobileNo { get; set; }

        [MaxLength(50)]
        [JsonPropertyName("role")]
        public string Role { get; set; } = "User";

        [JsonPropertyName("createdDate")]
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // ⭐️ Navigation Collection Property
        // เพื่อให้ EF Core ทราบว่า User หนึ่งคนสามารถมี UserPermission ได้หลายรายการ
        public ICollection<UserPermission> Permissions { get; set; } = new List<UserPermission>();
    }
}