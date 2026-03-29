git init
git config user.email "sidk4@example.com"
git config user.name "Sid"
git add .
git commit -m "Initialize standalone CPN_admin_panel repository"
git remote add origin https://github.com/Sid-Dev-alt/CPN_admin_panel.git || git remote set-url origin https://github.com/Sid-Dev-alt/CPN_admin_panel.git
git branch -M main
git push -f origin main
