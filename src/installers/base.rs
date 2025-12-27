use tokio::process::Command;

pub fn run_command(command: &str, args: &[&str]) -> Result<String, String> {
    let rt = tokio::runtime::Runtime::new().map_err(|e| format!("Ошибка создания runtime: {}", e))?;
    
    rt.block_on(async {
        let output = Command::new(command)
            .args(args)
            .output()
            .await
            .map_err(|e| format!("Ошибка выполнения команды: {}", e))?;

        if output.status.success() {
            Ok(String::from_utf8_lossy(&output.stdout).to_string())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("Команда завершилась с ошибкой: {}", stderr))
        }
    })
}

