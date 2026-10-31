  'use client';

  import { use, useState } from 'react';
  import { applyToJob, shortlistJob } from './action';


  export default function JobDetailPage({
    params,
  }: {
    params: Promise<{ id: string }>;
  }) {
    const { id } = use(params);

    const [status, setStatus] = useState<string | null>(null);

    async function handleApply() {
      const result = await applyToJob(id);

      setStatus(
        result.ok
          ? 'Applied!'
          : result.message ?? 'Error'
      );
    }

    async function handleShortlist() {
      const result = await shortlistJob(id);

      setStatus(
        result.ok
          ? 'Shortlisted!'
          : result.message ?? 'Already shortlisted or error'
      );
    }

    return (
      <main >
        <h1 className='text-2xl font-extrabold p-4 m-4 bg-amber-300 w-fit rounded-4xl'>Job id:{id}</h1>

        <button onClick={handleApply} className=" ml-6 p-4 m-4rounded-lg bg-green-600 px-5 py-3 
        font-semibold text-white shadow-sm 
        transition duration-200 hover:bg-green-700 
        hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer rounded-3xl">
          Apply
        </button>

        <button onClick={handleShortlist} className=" ml-3 border border-blue-600
        bg-white px-5 py-3 font-semibold text-blue-600 transition duration-200 hover:bg-blue-600
        hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 rounded-3xl">
          Shortlist
        </button>
          
        {status && 
        <p className='font-bold mt-6 ml-6 bg-blue-500 p-5 m-6 w-fit rounded-4xl text-white'>{status}</p>
        }
    
      </main>
    );
  }