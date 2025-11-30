using backend.Data;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(
    options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
); //สำหรับกำหนดรูปแบบฐานข้อมูลที่จะใช้

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:4200")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                          // หากต้องการอนุญาตทุก Origin ในช่วง Dev
                          // policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
                      });
});

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger(options =>
    {
        options.SerializeAsV2 = true;
    });
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    });
}

app.UseCors(MyAllowSpecificOrigins);

app.UseHttpsRedirection();

app.MapControllers();

app.Run();


// dotnet tool install --global dotnet-ef ติดตั้ง Microsoft.EntityFrameworkCore
// dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.0 ติดตั้ง Microsoft.EntityFrameworkCore.design
// dotnet add package Microsoft.EntityFrameworkCore.Tools --version 9.0.0 ติดตั้ง Microsoft.EntityFrameworkCore.tools
// dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 9.0.0 ติดตั้ง Microsoft.EntityFrameworkCore.sqlServer

// dotnet ef migrations add InitialCreate --project สร้างไฟล์ Migration ของตัว Model นั้น
// dotnet ef database update นำไฟล์ Migration ของตัว Model นั้นมาสร้างเพิ่มลงใน sql server