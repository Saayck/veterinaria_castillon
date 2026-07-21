using System;
using System.Data.SqlClient;
using System.IO;

class Program
{
    static void Main()
    {
        string[] connectionStrings = new string[] {
            "Server=localhost\\SQLEXPRESS;User Id=sa;Password=Castillon@2025;TrustServerCertificate=True;Encrypt=False;",
            "Server=localhost;User Id=sa;Password=Castillon@2025;TrustServerCertificate=True;Encrypt=False;",
            "Server=.;User Id=sa;Password=Castillon@2025;TrustServerCertificate=True;Encrypt=False;"
        };

        string sqlContent = File.ReadAllText(@"c:\Users\Usuario\Desktop\Skills\sql-init\init.sql");
        string[] scripts = sqlContent.Split(new[] { "GO\r\n", "GO\n", "GO " }, StringSplitOptions.RemoveEmptyEntries);

        SqlConnection conn = null;
        foreach (var cs in connectionStrings)
        {
            try {
                conn = new SqlConnection(cs);
                conn.Open();
                Console.WriteLine("Connected using: " + cs);
                break;
            } catch (Exception) {
                conn = null;
            }
        }

        if (conn == null) {
            Console.WriteLine("Could not connect with any string.");
            return;
        }

        using (conn)
        {
            foreach (string script in scripts)
            {
                if (string.IsNullOrWhiteSpace(script) || script.Trim().Equals("GO", StringComparison.OrdinalIgnoreCase)) continue;
                
                try
                {
                    using (SqlCommand cmd = new SqlCommand(script, conn))
                    {
                        cmd.ExecuteNonQuery();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error in script chunk: " + ex.Message);
                }
            }
            Console.WriteLine("Done executing init.sql");
        }
    }
}
