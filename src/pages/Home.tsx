import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Camera, Bell } from 'lucide-react';

function Home() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Share Your Board Game Collection
        </h1>
        <p className="text-lg text-gray-600">
          Connect with friends, share your games, and discover new favorites
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 transform transition hover:scale-105">
          <Users className="h-10 w-10 text-indigo-600 mb-3" />
          <h2 className="text-lg font-semibold mb-2">Private Group Access</h2>
          <p className="text-sm text-gray-600">
            Join an exclusive group of friends to share and borrow games safely
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 transform transition hover:scale-105">
          <Camera className="h-10 w-10 text-indigo-600 mb-3" />
          <h2 className="text-lg font-semibold mb-2">Quick Photo Cataloging</h2>
          <p className="text-sm text-gray-600">
            Add games to your collection with a simple photo
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 transform transition hover:scale-105">
          <BookOpen className="h-10 w-10 text-indigo-600 mb-3" />
          <h2 className="text-lg font-semibold mb-2">Easy Borrowing</h2>
          <p className="text-sm text-gray-600">
            Browse available games and request to borrow with one click
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 transform transition hover:scale-105">
          <Bell className="h-10 w-10 text-indigo-600 mb-3" />
          <h2 className="text-lg font-semibold mb-2">Smart Notifications</h2>
          <p className="text-sm text-gray-600">
            Stay updated on game requests and returns via email
          </p>
        </div>
      </div>

      <div className="text-center space-y-4">
        <Link
          to="/signup"
          className="inline-block w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Get Started
        </Link>
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Home;