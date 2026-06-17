import React from 'react';
import { Sparkles, Lightbulb, ShieldCheck } from 'lucide-react';

const ProjectSuggestions: React.FC = () => {
	const ideas = [
		{
			title: 'SOS Live Sharing',
			icon: <ShieldCheck size={20} className="text-white" />,
			description: 'Live location updates with safe route hints for responders.'
		},
		{
			title: 'Community Verification',
			icon: <Sparkles size={20} className="text-white" />,
			description: 'Upvotes and moderator review for trusted reports.'
		},
		{
			title: 'Smart Check-ins',
			icon: <Lightbulb size={20} className="text-white" />,
			description: 'Scheduled check-ins with auto-alert if missed.'
		}
	];

	return (
		<section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-10">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-800">Next Up Ideas</h2>
					<p className="text-gray-600 mt-2">Potential upgrades to make SafeSpace even stronger.</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{ideas.map((idea) => (
						<div key={idea.title} className="border border-gray-100 rounded-2xl p-6 shadow-md">
							<div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 mb-4">
								{idea.icon}
							</div>
							<h3 className="text-lg font-semibold text-gray-800 mb-2">{idea.title}</h3>
							<p className="text-sm text-gray-600">{idea.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default ProjectSuggestions;
