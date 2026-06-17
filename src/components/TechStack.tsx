import React from 'react';
import { Code, Database, Globe, Shield } from 'lucide-react';

const TechStack: React.FC = () => {
	const items = [
		{
			title: 'Frontend',
			icon: <Globe size={20} className="text-white" />,
			description: 'React + TypeScript + Vite + Tailwind CSS'
		},
		{
			title: 'Backend',
			icon: <Code size={20} className="text-white" />,
			description: 'Node.js + Express + JWT'
		},
		{
			title: 'Database',
			icon: <Database size={20} className="text-white" />,
			description: 'MongoDB Atlas + Mongoose'
		},
		{
			title: 'Security',
			icon: <Shield size={20} className="text-white" />,
			description: 'Auth, CORS, and secure APIs'
		}
	];

	return (
		<section className="py-16 px-4 sm:px-6 lg:px-8">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-10">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-800">Tech Stack</h2>
					<p className="text-gray-600 mt-2">Modern, scalable tools powering SafeSpace.</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{items.map((item) => (
						<div key={item.title} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
							<div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 mb-4">
								{item.icon}
							</div>
							<h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
							<p className="text-sm text-gray-600">{item.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default TechStack;
