import Link from 'next/link';
import AuthForm from '@/frontend/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
          <p className="text-gray-600 text-center mb-8">Login to your account</p>

          <AuthForm mode="login" />

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 text-center">
              Demo Account: <br />
              Email: demo@example.com <br />
              Password: demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
