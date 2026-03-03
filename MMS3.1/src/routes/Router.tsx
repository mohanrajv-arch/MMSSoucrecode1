// Updated router
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Navigate, createBrowserRouter } from 'react-router-dom';

import FullLayout from '../layouts/full/FullLayout';
import RecipeMaster from 'src/components/MasterSetup/RecipeMaster/RecipeMaster';
import AddRecipe from 'src/components/MasterSetup/RecipeMaster/AddRecipe';
import AuthLogin from 'src/components/Login/AuthLogin';
import RecipeDetails from 'src/components/MasterSetup/RecipeMaster/RecipeDetails';
import ModifyRecipe from 'src/components/MasterSetup/RecipeMaster/ModifyRecipe';
import RecipeHistory from 'src/components/MasterSetup/RecipeMaster/RecipeHistory';
import CategoryRecipeMapping from 'src/components/MasterSetup/CategoryMapping/CategoryMapping';
import MealTypeMapping from 'src/components/MasterSetup/MealTypeMapping/MealTypeMapping';
import ProtectedRoute from 'src/components/Login/ProtectedRoute';
import CountryOrigin from 'src/components/MasterSetup/CountryOrigin/CountryOrigin';
import MealType from 'src/components/MasterSetup/MealType/MealType';
import MealSetTemplate from 'src/components/MenuStructuring/MealSetTemplate/MealSetTemplate';
import CategoryMaster from 'src/components/MasterSetup/CategoryRecipe/CategoryRecipe';
import BasePortion from 'src/components/MasterSetup/BasePortionQty/BasePortion';
import ItemCategory from 'src/components/MasterSetup/ItemCategory/ItemCategory';
import AddMealSetTemplate from 'src/components/MenuStructuring/MealSetTemplate/AddMealTemplate';
import ViewMealSetTemplate from 'src/components/MenuStructuring/MealSetTemplate/ViewMealTemplate';
import ModifyMealTemplate from 'src/components/MenuStructuring/MealSetTemplate/ModifyMealTemplate';
import MealSetMenu from 'src/components/MenuStructuring/MealSetMenu/MealSetMenu';
import ViewMealSetMenu from 'src/components/MenuStructuring/MealSetMenu/ViewMealMenu';
import ModifyMealMenu from 'src/components/MenuStructuring/MealSetMenu/ModifyMealMenu';
import AddMealMenu from 'src/components/MenuStructuring/MealSetMenu/AddMealMenu';
import FinalMenuSet from 'src/components/MenuStructuring/FinalMenuSet/FinalMenuSet';
import AddFinalMenu from 'src/components/MenuStructuring/FinalMenuSet/AddFinalMenu';
import ViewFinalMenu from 'src/components/MenuStructuring/FinalMenuSet/ViewFinalMenu';
import ViewByMenu from 'src/components/MenuStructuring/FinalMenuSet/ViewByMenu';
import ModifyFinalMenu from 'src/components/MenuStructuring/FinalMenuSet/ModifyFinalMenu';
import RecipeEnquiry from 'src/components/Location Screens/RecipeEnquiry/RecipeEnquiry';
import RecipeListing from 'src/components/Recipe Listing/RecipeListing';
import RecipeListingView from 'src/components/Recipe Listing/RecipeListingView';
import MenuSimulation from 'src/components/MenuSimulations/MenuSimulations';
import ItemRequisition from 'src/components/Location Screens/ItemRequistion/ItemRequistion';
import RequisitionHistory from 'src/components/Location Screens/ItemRequistion/RequistionHistory';
import ViewItemRequisition from 'src/components/Location Screens/ItemRequistion/ViewItemRequistion';
import MenuLocationCalendar from 'src/components/BusinessOperations/IssueMenuToLocation/IssueMenutoLoc';
import EstimatedDashboard from 'src/components/Dashboards/EstimatedDashboard/EstimationDash';
import StockDashboard from 'src/components/Dashboards/StockDashboard/StockDashboard';
import Menu from 'src/components/Location Screens/MenuScreen/MenuScreen';
import UserCreation from 'src/components/UserMasters/UserCreation/UserCreations';
import UserLog from 'src/components/UserMasters/UserLog/userLog';
import ViewDetails from 'src/components/UserMasters/UserCreation/ViewUserDetails';
import UserRights from 'src/components/UserMasters/UserRights/userRights';
import ProjectSettingsConfiguration from 'src/components/MasterSetup/CommonMaster/CommonMaster';
import RecipeHistoryDetails from 'src/components/MasterSetup/RecipeMaster/RecipeHistoryDetails';
import EmptyScreen from 'src/components/EmptyScreen/Empty';


const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLogin />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <FullLayout />,
        children: [

             //Tranactions Screens

             //MealSetTemplate
           { path: 'screen/screen', element: <EmptyScreen /> },

          { path: 'Transaction/MealSetTemplate', element: <MealSetTemplate /> },
          { path: 'Transaction/AddMealTemplate', element: <AddMealSetTemplate /> },
          { path: 'Transaction/ViewMealTemplate', element: <ViewMealSetTemplate /> },
          { path: 'Transaction/ModifyMealTemplate', element: <ModifyMealTemplate /> },


           //MealSetMenu
          { path: 'Transaction/MealSetMenu', element: <MealSetMenu /> },
          { path: 'Transaction/AddMealMenu', element: <AddMealMenu /> },
          { path: 'Transaction/ViewMealMenu', element: <ViewMealSetMenu /> },
          { path: 'Transaction/ModifyMealMenu/:id', element: <ModifyMealMenu /> },

          //final meal set
          { path: 'Transaction/FinalMealSet', element: <FinalMenuSet /> },
          { path: 'Transaction/ViewFinalMenu', element: <ViewFinalMenu /> },
          { path: 'Transaction/ViewByMenu', element: <ViewByMenu /> },
          { path: 'Transaction/ModifyFinalMenu/:id', element: <ModifyFinalMenu /> },

          { path: 'Transaction/AddFinalMenu', element: <AddFinalMenu /> },


          //Recipe Master Screens
          { path: 'Master/recipeMaster', element: <RecipeMaster /> },
          { path: 'Master/AddRecipe', element: <AddRecipe /> },
          { path: 'Master/RecipeDetails', element: <RecipeDetails /> },
          { path: 'Master/RecipeHistoryDetails', element: <RecipeHistoryDetails /> },
          { path: 'Master/ModifyRecipe', element: <ModifyRecipe /> },
          { path: 'Master/RecipeHistory', element: <RecipeHistory /> },

          //Category Recipe Mapping
          { path: 'Master/CategoryRecipe', element: <CategoryRecipeMapping /> },

          //Meal Type Mapping
          { path: 'Master/MealTypeMapping', element: <MealTypeMapping /> },

          //Country Origin
          { path: 'Master/CountryOrigin', element: <CountryOrigin /> },

           //Meal Type
          { path: 'Master/MealType', element: <MealType /> },

          //Recipe Category
          { path: 'Master/RecipeCategory', element: <CategoryMaster /> },

            //Base Portion Quantity
          { path: 'Master/BasePortion', element: <BasePortion /> },

           //ItemCategory
          { path: 'Master/ItemCategory', element: <ItemCategory /> },

          { path: 'Location/RecipeEnquiry', element: <RecipeEnquiry /> },


          {path: 'Master/RecipeListing', element: <RecipeListing />},


          {path: 'Master/RecipeListingView', element: <RecipeListingView />},

          //MenuSimaulations
         {path: 'Transaction/MenuSimulation', element: <MenuSimulation />},

         {path: 'Master/ItemRequisition', element: <ItemRequisition />},
 
           //Requisition History
          {path: 'Master/RequisitionHistory', element: <RequisitionHistory />},
 
            //View Item Requisition
            {path: 'Master/ViewItemRequisition', element: <ViewItemRequisition />},

            { path: 'business/issueMenuToLocation', element: <MenuLocationCalendar /> },

            { path: 'Dashboard/EstimatedDashboard', element: <EstimatedDashboard /> },

            { path: 'Dashboard/StockDashboard', element: <StockDashboard /> },
            
            { path: 'Location/MenuScreen', element: <Menu /> },



                // User Creations

         { path: 'userMaster/userCreations', element: <UserCreation /> },
         { path: 'userMaster/ViewUserDetails', element: <ViewDetails /> },


         { path: 'userMaster/userLog', element: <UserLog /> },
         { path: 'userMaster/userRights', element: <UserRights /> },
         { path: 'CommonMaster/CommonMaster', element: < ProjectSettingsConfiguration/> },


        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;