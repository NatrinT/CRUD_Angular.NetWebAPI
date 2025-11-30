using backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
public class UserPermission
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    [JsonPropertyName("RoleName")]
    public string RoleName { get; set; } = string.Empty;

    [JsonPropertyName("CanRead")]
    public bool CanRead { get; set; }

    [JsonPropertyName("CanWrite")]
    public bool CanWrite { get; set; }

    [JsonPropertyName("CanDelete")]
    public bool CanDelete { get; set; }

    [Required]
    public int UserId { get; set; }

    // 2. Navigation Property: ใช้สำหรับเข้าถึง User object ที่ถูกผูกไว้
    //    [JsonIgnore] เพื่อป้องกันการวนซ้ำในการ Serialize (Serialization Cycle)
    [JsonIgnore]
    [ForeignKey("UserId")]
    public User? User { get; set; } // ให้เป็น nullable หากคุณอนุญาตให้สิทธิ์ไม่มี User
}