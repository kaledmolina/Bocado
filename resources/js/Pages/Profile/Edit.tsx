import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-6 sm:py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-2xl"
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
