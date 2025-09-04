document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
  const API_BASE_URL = 'https://ai-exam-maker.onrender.com/api';

    // --- Element Selectors ---
    const generateTextBtn = document.getElementById('generate-text-btn');
    const generateImageBtn = document.getElementById('generate-image-btn');
    const printBtn = document.getElementById('print-btn');
    const textPromptInput = document.getElementById('text-prompt');
    const imageUploadInput = document.getElementById('image-upload');
    const loader = document.getElementById('loader');
    const questionsPreview = document.getElementById('preview-questions');

    // Header Input Elements
    const headerInputs = {
        schoolName: document.getElementById('school-name'),
        examTitle: document.getElementById('exam-title'),
        className: document.getElementById('class-name'),
        subjectName: document.getElementById('subject-name'),
        maxMarks: document.getElementById('max-marks'),
        timeAllowed: document.getElementById('time-allowed'),
    };
    
    // Header Preview Elements
    const headerPreviews = {
        schoolName: document.getElementById('preview-school-name'),
        examTitle: document.getElementById('preview-exam-title'),
        className: document.getElementById('preview-class'),
        subjectName: document.getElementById('preview-subject'),
        maxMarks: document.getElementById('preview-marks'),
        timeAllowed: document.getElementById('preview-time'),
    };

    // --- Functions ---
    const showLoader = (show) => {
        loader.classList.toggle('hidden', !show);
    };

    const updatePreviewHeader = () => {
        headerPreviews.schoolName.textContent = headerInputs.schoolName.value || 'School Name';
        headerPreviews.examTitle.textContent = headerInputs.examTitle.value || 'Exam Title';
        headerPreviews.className.textContent = `Class: ${headerInputs.className.value || '_______'}`;
        headerPreviews.subjectName.textContent = `Subject: ${headerInputs.subjectName.value || '_______'}`;
        headerPreviews.timeAllowed.textContent = `Time: ${headerInputs.timeAllowed.value || '_______'}`;
        headerPreviews.maxMarks.textContent = `M.M: ${headerInputs.maxMarks.value || '_______'}`;
    };

    const generateFromText = async () => {
        const prompt = textPromptInput.value;
        if (!prompt) {
            alert('Please enter a prompt.');
            return;
        }

        showLoader(true);
        try {
            const response = await fetch(`${API_BASE_URL}/generate-from-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            questionsPreview.textContent = data.generated_text;

        } catch (error) {
            console.error('Error generating from text:', error);
            alert('Failed to generate content. Please check the console for details.');
            questionsPreview.textContent = 'An error occurred. Please try again.';
        } finally {
            showLoader(false);
        }
    };
    
    const generateFromImage = async () => {
        const file = imageUploadInput.files[0];
        if (!file) {
            alert('Please select an image file.');
            return;
        }

        const formData = new FormData();
        formData.append('paperImage', file);
        
        showLoader(true);
        try {
            const response = await fetch(`${API_BASE_URL}/generate-from-image`, {
                method: 'POST',
                body: formData,
            });

             if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            questionsPreview.textContent = data.generated_text;

        } catch (error) {
            console.error('Error generating from image:', error);
            alert('Failed to extract content from image. Please check the console for details.');
            questionsPreview.textContent = 'An error occurred. Please try again.';
        } finally {
            showLoader(false);
        }
    };

    // --- Event Listeners ---
    generateTextBtn.addEventListener('click', generateFromText);
    generateImageBtn.addEventListener('click', generateFromImage);
    printBtn.addEventListener('click', () => window.print());

    // Live update for header preview
    Object.values(headerInputs).forEach(input => {
        input.addEventListener('input', updatePreviewHeader);
    });

    // Initial call to set default header text
    updatePreviewHeader(); 
});
