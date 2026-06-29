const bildirimVer = (mesaj, tip) => {
    const kutu = document.getElementById("bildirim-kutusu");
    if (!kutu) return;
    const b = document.createElement("div");
    b.className = `bildirim ${tip}`;
    b.innerText = mesaj;
    kutu.appendChild(b);
    setTimeout(() => { b.classList.add("goster"); setTimeout(() => { b.classList.remove("goster"); setTimeout(() => b.remove(), 500); }, 3000); }, 100);
};

const authForm = document.getElementById('authForm');
if (authForm) {
    const toggleLink = document.getElementById('toggleLink');
    let isLogin = true;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'register') toggleMode();

    toggleLink.onclick = toggleMode;

    function toggleMode() {
        isLogin = !isLogin;
        document.getElementById('form-title').innerText = isLogin ? "Giriş Yap" : "Kayıt Ol";
        document.getElementById('submitBtn').innerText = isLogin ? "Giriş Yap" : "Kayıt Ol";
        toggleLink.innerText = isLogin ? "Hesabın yok mu? Kayıt Ol" : "Zaten hesabın var mı? Giriş Yap";
        document.getElementById('reg-username').style.display = isLogin ? "none" : "block";
        document.getElementById('password-confirm').style.display = isLogin ? "none" : "block";
        document.getElementById('reg-username').required = !isLogin;
        document.getElementById('password-confirm').required = !isLogin;
    }

    authForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (isLogin) {
            const user = JSON.parse(localStorage.getItem(`user_${email}`));
            if (user && user.password === password) {
                localStorage.setItem("currentUser", user.username);
                localStorage.setItem("currentUserEmail", email);
                window.location.href = "index.html";
            } else {
                bildirimVer("Hatalı e-posta veya şifre!", "hata");
            }
        } else {
            const buyukHarf = /[A-Z]/.test(password);
            const sembol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            if (password.length < 7) {
                bildirimVer("Şifre en az 7 karakter olmalıdır!", "hata");
                return;
            }
            if (!buyukHarf || !sembol) {
                bildirimVer("Şifre en az bir büyük harf ve sembol içermeli!", "hata");
                return;
            }
            if (password !== document.getElementById('password-confirm').value) {
                bildirimVer("Şifreler uyuşmuyor!", "hata");
                return;
            }

            localStorage.setItem(`user_${email}`, JSON.stringify({
                username: document.getElementById('reg-username').value, 
                email, 
                password
            }));
            bildirimVer("Kayıt başarılı! Giriş yapabilirsiniz.", "basari");
            toggleMode();
        }
    };
}