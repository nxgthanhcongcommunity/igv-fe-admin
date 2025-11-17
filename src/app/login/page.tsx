"use client"

export default function LoginPage() {

    const handleLogin = () => {
        window.location.href = "http://localhost:5000/auth/google";
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <form>
                <div className="bg-[#0e1012] text-white h-[360px] rounded-2xl lg:p-8 p-4 w-full lg:w-[500px]">
                    <h2 className="text-2xl font-bold text-center">Đăng nhập</h2>
                    <div className="flex items-center justify-center mt-20">
                        <span className="bg-[#f29620] text-black text-md rounded-full py-2 px-10  w-[90%] flex justify-center items-center cursor-pointer">
                            <span onClick={handleLogin}>
                                Đăng nhập với Google
                            </span>
                        </span>
                    </div>
                </div>
            </form>
        </div>
    );
}
