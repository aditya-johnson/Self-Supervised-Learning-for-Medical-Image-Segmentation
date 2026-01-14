"""
Backend API Testing for MedVision SSL Framework
Tests all endpoints including datasets, models, experiments, evaluations, and dashboard
"""
import requests
import sys
import json
from datetime import datetime

class MedVisionAPITester:
    def __init__(self, base_url="https://medvision-ai-10.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ids = {
            'datasets': [],
            'models': [],
            'experiments': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'id' in response_data:
                        print(f"   Created ID: {response_data['id']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        return self.run_test("Dashboard Stats", "GET", "dashboard/stats", 200)

    def test_seed_data(self):
        """Test seeding demo data"""
        success, response = self.run_test("Seed Demo Data", "POST", "seed", 200)
        if success:
            print(f"   Seeded: {response.get('datasets', 0)} datasets, {response.get('models', 0)} models, {response.get('experiments', 0)} experiments")
        return success, response

    def test_datasets_crud(self):
        """Test datasets CRUD operations"""
        print("\n📊 Testing Datasets CRUD...")
        
        # Get all datasets
        success, datasets = self.run_test("Get All Datasets", "GET", "datasets", 200)
        if not success:
            return False
        
        # Create new dataset
        new_dataset = {
            "name": f"Test Dataset {datetime.now().strftime('%H%M%S')}",
            "modality": "ct",
            "description": "Test dataset for API testing",
            "num_samples": 50,
            "num_labeled": 5,
            "resolution": "128x128x64"
        }
        
        success, created = self.run_test("Create Dataset", "POST", "datasets", 200, new_dataset)
        if success and 'id' in created:
            dataset_id = created['id']
            self.created_ids['datasets'].append(dataset_id)
            
            # Get specific dataset
            success, _ = self.run_test("Get Specific Dataset", "GET", f"datasets/{dataset_id}", 200)
            
            # Delete dataset
            success, _ = self.run_test("Delete Dataset", "DELETE", f"datasets/{dataset_id}", 200)
            if success:
                self.created_ids['datasets'].remove(dataset_id)
        
        return True

    def test_models_crud(self):
        """Test model configurations CRUD operations"""
        print("\n🤖 Testing Model Configurations CRUD...")
        
        # Get all models
        success, models = self.run_test("Get All Models", "GET", "models", 200)
        if not success:
            return False
        
        # Create new model
        new_model = {
            "name": f"Test Model {datetime.now().strftime('%H%M%S')}",
            "architecture": "3d_unet",
            "encoder_depth": 4,
            "num_channels": 1,
            "feature_dim": 256,
            "projection_dim": 64
        }
        
        success, created = self.run_test("Create Model Config", "POST", "models", 200, new_model)
        if success and 'id' in created:
            model_id = created['id']
            self.created_ids['models'].append(model_id)
            
            # Get specific model
            success, _ = self.run_test("Get Specific Model", "GET", f"models/{model_id}", 200)
            
            # Delete model
            success, _ = self.run_test("Delete Model Config", "DELETE", f"models/{model_id}", 200)
            if success:
                self.created_ids['models'].remove(model_id)
        
        return True

    def test_experiments_workflow(self):
        """Test experiments workflow including creation and training"""
        print("\n🧪 Testing Experiments Workflow...")
        
        # First ensure we have datasets and models (from seeded data)
        success, datasets = self.run_test("Get Datasets for Experiments", "GET", "datasets", 200)
        if not success or not datasets:
            print("❌ No datasets available for experiment testing")
            return False
            
        success, models = self.run_test("Get Models for Experiments", "GET", "models", 200)
        if not success or not models:
            print("❌ No models available for experiment testing")
            return False
        
        # Get all experiments
        success, experiments = self.run_test("Get All Experiments", "GET", "experiments", 200)
        if not success:
            return False
        
        # Create new experiment
        new_experiment = {
            "name": f"Test Experiment {datetime.now().strftime('%H%M%S')}",
            "description": "Test experiment for API testing",
            "dataset_id": datasets[0]['id'],
            "model_config_id": models[0]['id'],
            "pretraining_method": "contrastive",
            "training_config": {
                "learning_rate": 0.0001,
                "batch_size": 2,
                "num_epochs": 10,
                "warmup_epochs": 2,
                "temperature": 0.07
            }
        }
        
        success, created = self.run_test("Create Experiment", "POST", "experiments", 200, new_experiment)
        if success and 'id' in created:
            experiment_id = created['id']
            self.created_ids['experiments'].append(experiment_id)
            
            # Get specific experiment
            success, _ = self.run_test("Get Specific Experiment", "GET", f"experiments/{experiment_id}", 200)
            
            # Start training (simulated)
            success, training_result = self.run_test("Start Training", "POST", f"experiments/{experiment_id}/start", 200)
            if success:
                print(f"   Training completed with best loss: {training_result.get('best_loss', 'N/A')}")
            
            # Get experiment metrics
            success, metrics = self.run_test("Get Experiment Metrics", "GET", f"experiments/{experiment_id}/metrics", 200)
            if success:
                print(f"   Metrics: Status={metrics.get('status')}, Epochs={metrics.get('current_epoch')}")
            
            # Delete experiment
            success, _ = self.run_test("Delete Experiment", "DELETE", f"experiments/{experiment_id}", 200)
            if success:
                self.created_ids['experiments'].remove(experiment_id)
        
        return True

    def test_evaluations(self):
        """Test evaluation endpoints"""
        print("\n📈 Testing Evaluations...")
        
        # Get all evaluations
        success, evaluations = self.run_test("Get All Evaluations", "GET", "evaluations", 200)
        if success:
            print(f"   Found {len(evaluations)} evaluations")
        
        # Get model comparison
        success, comparison = self.run_test("Get Model Comparison", "GET", "evaluations/compare", 200)
        if success:
            ssl_data = comparison.get('ssl_pretrained', [])
            supervised_data = comparison.get('supervised', [])
            print(f"   Comparison data: {len(ssl_data)} SSL points, {len(supervised_data)} supervised points")
        
        return success

    def test_visualization(self):
        """Test visualization endpoints"""
        print("\n🎨 Testing Visualization...")
        
        # Get embeddings
        success, embeddings = self.run_test("Get Embeddings", "GET", "visualization/embeddings", 200, params={'num_samples': 50})
        if success:
            emb_data = embeddings.get('embeddings', [])
            print(f"   Generated {len(emb_data)} embedding points")
        
        # Get slice data
        success, slice_data = self.run_test("Get Slice Data", "GET", "visualization/slice/32", 200, params={'total_slices': 64})
        if success:
            print(f"   Slice data keys: {list(slice_data.keys())}")
        
        return success

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n⚠️  Testing Error Handling...")
        
        # Test 404 errors
        self.run_test("Get Non-existent Dataset", "GET", "datasets/invalid-id", 404)
        self.run_test("Get Non-existent Model", "GET", "models/invalid-id", 404)
        self.run_test("Get Non-existent Experiment", "GET", "experiments/invalid-id", 404)
        
        # Test invalid experiment creation
        invalid_experiment = {
            "name": "Invalid Experiment",
            "dataset_id": "invalid-dataset-id",
            "model_config_id": "invalid-model-id",
            "pretraining_method": "contrastive"
        }
        self.run_test("Create Invalid Experiment", "POST", "experiments", 404, invalid_experiment)
        
        return True

    def cleanup(self):
        """Clean up any remaining test data"""
        print("\n🧹 Cleaning up test data...")
        
        for experiment_id in self.created_ids['experiments']:
            self.run_test(f"Cleanup Experiment {experiment_id}", "DELETE", f"experiments/{experiment_id}", 200)
        
        for model_id in self.created_ids['models']:
            self.run_test(f"Cleanup Model {model_id}", "DELETE", f"models/{model_id}", 200)
            
        for dataset_id in self.created_ids['datasets']:
            self.run_test(f"Cleanup Dataset {dataset_id}", "DELETE", f"datasets/{dataset_id}", 200)

def main():
    print("🏥 MedVision SSL Framework - Backend API Testing")
    print("=" * 60)
    
    tester = MedVisionAPITester()
    
    try:
        # Test API availability
        success, _ = tester.test_api_root()
        if not success:
            print("❌ API is not accessible, stopping tests")
            return 1
        
        # Test dashboard (should work even without data)
        tester.test_dashboard_stats()
        
        # Seed demo data first
        tester.test_seed_data()
        
        # Test all CRUD operations
        tester.test_datasets_crud()
        tester.test_models_crud()
        tester.test_experiments_workflow()
        
        # Test evaluation and visualization
        tester.test_evaluations()
        tester.test_visualization()
        
        # Test error handling
        tester.test_error_handling()
        
        # Clean up
        tester.cleanup()
        
    except KeyboardInterrupt:
        print("\n⚠️  Testing interrupted by user")
        tester.cleanup()
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        tester.cleanup()
        return 1
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        failed = tester.tests_run - tester.tests_passed
        print(f"❌ {failed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())